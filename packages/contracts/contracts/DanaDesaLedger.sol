// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DanaDesaLedger is AccessControl {
    bytes32 public constant KAUR_ROLE = keccak256("KAUR_ROLE");
    bytes32 public constant SEKDES_ROLE = keccak256("SEKDES_ROLE");
    bytes32 public constant KADES_ROLE = keccak256("KADES_ROLE");
    bytes32 public constant KAUR_KEUANGAN_ROLE = keccak256("KAUR_KEUANGAN_ROLE");

    enum DisbursementStatus {
        PENDING_SEKDES,
        RETURNED_FOR_REVISION,
        PENDING_KADES,
        PENDING_EKSEKUSI,
        DISBURSED,
        REJECTED_SYSTEM
    }

    struct Proposal {
        uint256 id;
        string dusun;
        string kategori;
        uint256 paguMaksimal;
        address kaurTeknis;
        bytes32 dokumenHash;
        uint256 createdAt;
    }

    struct Disbursement {
        uint256 id;
        uint256 proposalId;
        uint256 nominal;
        bytes32 beritaAcaraHash;
        string geotag;
        DisbursementStatus status;
        address kaurTeknis;
        address sekdesVerifier;
        address kadesApprover;
        string catatanRevisi;
        uint256 submittedAt;
        uint256 verifiedAt;
        uint256 disbursedAt;
    }

    uint256 private _proposalCounter;
    uint256 private _disbursementCounter;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Disbursement) public disbursements;
    // proposalId => total disbursed amount
    mapping(uint256 => uint256) public totalDisbursedPerProposal;

    event ProposalRegistered(uint256 indexed proposalId, address indexed kaurTeknis, bytes32 dokumenHash, uint256 timestamp);
    event DisbursementSubmitted(uint256 indexed disbursementId, uint256 indexed proposalId, uint256 nominal, uint256 timestamp);
    event VerifiedBySekdes(uint256 indexed disbursementId, address indexed sekdes, uint256 timestamp);
    event ReturnedForRevision(uint256 indexed disbursementId, string catatan, uint256 timestamp);
    event AuthorizedByKades(uint256 indexed disbursementId, address indexed kades, uint256 timestamp);
    event Disbursed(uint256 indexed disbursementId, address indexed kaurKeuangan, uint256 timestamp);
    event InterventionRejected(uint256 indexed disbursementId, address indexed kades, bytes32 reasonHash, uint256 timestamp);

    error ExceedsPagu();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerProposal(
        string calldata dusun,
        string calldata kategori,
        uint256 paguMaksimal,
        bytes32 dokumenHash
    ) external onlyRole(KAUR_ROLE) {
        _proposalCounter++;
        uint256 newId = _proposalCounter;

        proposals[newId] = Proposal({
            id: newId,
            dusun: dusun,
            kategori: kategori,
            paguMaksimal: paguMaksimal,
            kaurTeknis: msg.sender,
            dokumenHash: dokumenHash,
            createdAt: block.timestamp
        });

        emit ProposalRegistered(newId, msg.sender, dokumenHash, block.timestamp);
    }

    function submitDisbursement(
        uint256 proposalId,
        uint256 nominal,
        bytes32 beritaAcaraHash,
        string calldata geotag
    ) external onlyRole(KAUR_ROLE) {
        require(proposalId > 0 && proposalId <= _proposalCounter, "Invalid proposal ID");
        if (totalDisbursedPerProposal[proposalId] + nominal > proposals[proposalId].paguMaksimal) {
            revert ExceedsPagu();
        }

        _disbursementCounter++;
        uint256 newId = _disbursementCounter;

        disbursements[newId] = Disbursement({
            id: newId,
            proposalId: proposalId,
            nominal: nominal,
            beritaAcaraHash: beritaAcaraHash,
            geotag: geotag,
            status: DisbursementStatus.PENDING_SEKDES,
            kaurTeknis: msg.sender,
            sekdesVerifier: address(0),
            kadesApprover: address(0),
            catatanRevisi: "",
            submittedAt: block.timestamp,
            verifiedAt: 0,
            disbursedAt: 0
        });

        emit DisbursementSubmitted(newId, proposalId, nominal, block.timestamp);
    }

    function verifyBySekdes(uint256 disbursementId) external onlyRole(SEKDES_ROLE) {
        Disbursement storage disb = disbursements[disbursementId];
        require(disb.id != 0, "Invalid disbursement ID");
        require(
            disb.status == DisbursementStatus.PENDING_SEKDES || disb.status == DisbursementStatus.RETURNED_FOR_REVISION,
            "Invalid status for verification"
        );

        disb.status = DisbursementStatus.PENDING_KADES;
        disb.sekdesVerifier = msg.sender;
        disb.verifiedAt = block.timestamp;

        emit VerifiedBySekdes(disbursementId, msg.sender, block.timestamp);
    }

    function returnForRevision(uint256 disbursementId, string calldata catatan) external {
        require(hasRole(SEKDES_ROLE, msg.sender) || hasRole(KADES_ROLE, msg.sender), "Caller is not SEKDES or KADES");
        Disbursement storage disb = disbursements[disbursementId];
        require(disb.id != 0, "Invalid disbursement ID");
        require(
            disb.status == DisbursementStatus.PENDING_SEKDES || disb.status == DisbursementStatus.PENDING_KADES,
            "Invalid status for revision"
        );

        disb.status = DisbursementStatus.RETURNED_FOR_REVISION;
        disb.catatanRevisi = catatan;

        emit ReturnedForRevision(disbursementId, catatan, block.timestamp);
    }

    function authorizeByKades(uint256 disbursementId) external onlyRole(KADES_ROLE) {
        Disbursement storage disb = disbursements[disbursementId];
        require(disb.id != 0, "Invalid disbursement ID");
        require(disb.status == DisbursementStatus.PENDING_KADES, "Must be PENDING_KADES");

        disb.status = DisbursementStatus.PENDING_EKSEKUSI;
        disb.kadesApprover = msg.sender;

        emit AuthorizedByKades(disbursementId, msg.sender, block.timestamp);
    }

    function executeDisbursement(uint256 disbursementId) external onlyRole(KAUR_KEUANGAN_ROLE) {
        Disbursement storage disb = disbursements[disbursementId];
        require(disb.id != 0, "Invalid disbursement ID");
        require(disb.status == DisbursementStatus.PENDING_EKSEKUSI, "Must be PENDING_EKSEKUSI");

        // Double check pagu before finalizing
        if (totalDisbursedPerProposal[disb.proposalId] + disb.nominal > proposals[disb.proposalId].paguMaksimal) {
            revert ExceedsPagu();
        }

        disb.status = DisbursementStatus.DISBURSED;
        disb.disbursedAt = block.timestamp;
        
        // Update accumulated disbursement for the proposal
        totalDisbursedPerProposal[disb.proposalId] += disb.nominal;

        emit Disbursed(disbursementId, msg.sender, block.timestamp);
    }

    function rejectIntervention(uint256 disbursementId, bytes32 reasonHash) external onlyRole(KADES_ROLE) {
        Disbursement storage disb = disbursements[disbursementId];
        require(disb.id != 0, "Invalid disbursement ID");
        require(disb.status != DisbursementStatus.DISBURSED, "Already disbursed");
        require(disb.status != DisbursementStatus.REJECTED_SYSTEM, "Already rejected");

        disb.status = DisbursementStatus.REJECTED_SYSTEM;

        emit InterventionRejected(disbursementId, msg.sender, reasonHash, block.timestamp);
    }

    function verifyHash(uint256 disbursementId, bytes32 uploadedHash) public view returns (bool) {
        require(disbursements[disbursementId].id != 0, "Invalid disbursement ID");
        return disbursements[disbursementId].beritaAcaraHash == uploadedHash;
    }

    function getSisaPagu(uint256 proposalId) public view returns (uint256) {
        require(proposalId > 0 && proposalId <= _proposalCounter, "Invalid proposal ID");
        return proposals[proposalId].paguMaksimal - totalDisbursedPerProposal[proposalId];
    }
}
