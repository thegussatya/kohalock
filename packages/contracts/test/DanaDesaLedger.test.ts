import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DanaDesaLedger } from "../typechain-types";

describe("DanaDesaLedger", function () {
  let contract: DanaDesaLedger;
  let admin: HardhatUser;
  let kaur: HardhatEthersSigner;
  let sekdes: HardhatEthersSigner;
  let kades: HardhatEthersSigner;
  let kaurKeuangan: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  // Type placeholder for standard test accounts
  type HardhatUser = HardhatEthersSigner;

  const KAUR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KAUR_ROLE"));
  const SEKDES_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SEKDES_ROLE"));
  const KADES_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KADES_ROLE"));
  const KAUR_KEUANGAN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KAUR_KEUANGAN_ROLE"));

  const DOKUMEN_HASH = ethers.keccak256(ethers.toUtf8Bytes("Dokumen Musrembang"));
  const BERITA_ACARA_HASH = ethers.keccak256(ethers.toUtf8Bytes("Berita Acara"));
  const REASON_HASH = ethers.keccak256(ethers.toUtf8Bytes("Reason"));

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    admin = signers[0];
    kaur = signers[1];
    sekdes = signers[2];
    kades = signers[3];
    kaurKeuangan = signers[4];
    otherAccount = signers[5];

    const Factory = await ethers.getContractFactory("DanaDesaLedger");
    contract = (await Factory.deploy()) as DanaDesaLedger;
    await contract.waitForDeployment();

    await contract.grantRole(KAUR_ROLE, kaur.address);
    await contract.grantRole(SEKDES_ROLE, sekdes.address);
    await contract.grantRole(KADES_ROLE, kades.address);
    await contract.grantRole(KAUR_KEUANGAN_ROLE, kaurKeuangan.address);
  });

  describe("Proposal Registration", function () {
    it("Should register a proposal successfully", async function () {
      const tx = await contract.connect(kaur).registerProposal(
        "Dusun 1",
        "Pembangunan Jalan",
        ethers.parseEther("1000"), // 1000 units
        DOKUMEN_HASH
      );

      await expect(tx).to.emit(contract, "ProposalRegistered");
      const proposal = await contract.proposals(1);
      expect(proposal.dusun).to.equal("Dusun 1");
      expect(proposal.paguMaksimal).to.equal(ethers.parseEther("1000"));
    });

    it("Should revert if non-KAUR tries to register a proposal", async function () {
      await expect(
        contract.connect(otherAccount).registerProposal(
          "Dusun 1",
          "Kategori",
          1000,
          DOKUMEN_HASH
        )
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Disbursement Workflow", function () {
    beforeEach(async function () {
      await contract.connect(kaur).registerProposal(
        "Dusun 1",
        "Pembangunan",
        ethers.parseEther("1000"),
        DOKUMEN_HASH
      );
    });

    it("Should complete the full successful workflow", async function () {
      // 1. Submit by KAUR
      const submitTx = await contract.connect(kaur).submitDisbursement(
        1,
        ethers.parseEther("400"),
        BERITA_ACARA_HASH,
        "-6.2,106.8"
      );
      await expect(submitTx).to.emit(contract, "DisbursementSubmitted").withArgs(1, 1, ethers.parseEther("400"), (await ethers.provider.getBlock("latest"))!.timestamp);

      // 2. Verify by SEKDES
      const verifyTx = await contract.connect(sekdes).verifyBySekdes(1);
      await expect(verifyTx).to.emit(contract, "VerifiedBySekdes");

      // 3. Authorize by KADES
      const authTx = await contract.connect(kades).authorizeByKades(1);
      await expect(authTx).to.emit(contract, "AuthorizedByKades");

      // 4. Execute by KAUR_KEUANGAN
      const execTx = await contract.connect(kaurKeuangan).executeDisbursement(1);
      await expect(execTx).to.emit(contract, "Disbursed");

      // 5. Check Sisa Pagu
      const sisa = await contract.getSisaPagu(1);
      expect(sisa).to.equal(ethers.parseEther("600"));
    });

    it("Should fail if nominal exceeds sisa pagu", async function () {
      await expect(
        contract.connect(kaur).submitDisbursement(
          1,
          ethers.parseEther("1001"),
          BERITA_ACARA_HASH,
          "-6.2,106.8"
        )
      ).to.be.revertedWithCustomError(contract, "ExceedsPagu");
    });

    it("Should allow returning for revision and re-submitting logic", async function () {
      await contract.connect(kaur).submitDisbursement(1, ethers.parseEther("400"), BERITA_ACARA_HASH, "");
      
      const revTx = await contract.connect(sekdes).returnForRevision(1, "Dokumen kurang jelas");
      await expect(revTx).to.emit(contract, "ReturnedForRevision").withArgs(1, "Dokumen kurang jelas", (await ethers.provider.getBlock("latest"))!.timestamp);

      const disb = await contract.disbursements(1);
      expect(disb.status).to.equal(1); // 1 = RETURNED_FOR_REVISION

      // KAUR resubmits by maybe calling verify? Wait, the spec says sekdes verifies again
      const verifyTx = await contract.connect(sekdes).verifyBySekdes(1);
      await expect(verifyTx).to.emit(contract, "VerifiedBySekdes");
    });

    it("Should allow KADES to reject intervention (Panic Button)", async function () {
      await contract.connect(kaur).submitDisbursement(1, ethers.parseEther("400"), BERITA_ACARA_HASH, "");
      await contract.connect(sekdes).verifyBySekdes(1);

      const rejectTx = await contract.connect(kades).rejectIntervention(1, REASON_HASH);
      await expect(rejectTx).to.emit(contract, "InterventionRejected");

      const disb = await contract.disbursements(1);
      expect(disb.status).to.equal(5); // REJECTED_SYSTEM
    });
  });

  describe("verifyHash", function () {
    it("Should return true for exact hash match", async function () {
      await contract.connect(kaur).registerProposal("D1", "K1", 1000, DOKUMEN_HASH);
      await contract.connect(kaur).submitDisbursement(1, 500, BERITA_ACARA_HASH, "");

      const isValid = await contract.verifyHash(1, BERITA_ACARA_HASH);
      expect(isValid).to.be.true;
    });

    it("Should return false for a mismatched hash", async function () {
      await contract.connect(kaur).registerProposal("D1", "K1", 1000, DOKUMEN_HASH);
      await contract.connect(kaur).submitDisbursement(1, 500, BERITA_ACARA_HASH, "");

      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("Berita Acara Salah"));
      const isValid = await contract.verifyHash(1, wrongHash);
      expect(isValid).to.be.false;
    });
  });

  describe("LPJ Submission", function () {
    const LPJ_HASH = ethers.keccak256(ethers.toUtf8Bytes("LPJ Hash"));

    beforeEach(async function () {
      await contract.connect(kaur).registerProposal("D1", "K1", ethers.parseEther("1000"), DOKUMEN_HASH);
      await contract.connect(kaur).submitDisbursement(1, ethers.parseEther("400"), BERITA_ACARA_HASH, "");
      await contract.connect(sekdes).verifyBySekdes(1);
      await contract.connect(kades).authorizeByKades(1);
      await contract.connect(kaurKeuangan).executeDisbursement(1);
    });

    it("Should allow KAUR to submit LPJ Teknis", async function () {
      const tx = await contract.connect(kaur).submitLpjTeknis(1, ethers.parseEther("400"), LPJ_HASH);
      await expect(tx).to.emit(contract, "LpjTeknisSubmitted");

      const disb = await contract.disbursements(1);
      expect(disb.lpjHash).to.equal(LPJ_HASH);
      expect(disb.lpjAmount).to.equal(ethers.parseEther("400"));
    });

    it("Should allow KAUR KEUANGAN to submit LPJ Keuangan", async function () {
      const tx = await contract.connect(kaurKeuangan).submitLpjKeuangan(1, LPJ_HASH);
      await expect(tx).to.emit(contract, "LpjKeuanganSubmitted");

      const prop = await contract.proposals(1);
      expect(prop.lpjKeuanganHash).to.equal(LPJ_HASH);
    });

    it("Should allow KADES to submit LPJ Desa", async function () {
      const tx = await contract.connect(kades).submitLpjDesa(2026, 1, LPJ_HASH);
      await expect(tx).to.emit(contract, "LpjDesaSubmitted");

      const hash = await contract.lpjDesaHashes(2026, 1);
      expect(hash).to.equal(LPJ_HASH);
    });
  });
});
