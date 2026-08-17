# SMART CONTRACT SPEC — DanaDesaLedger.sol

## 1. Tujuan

Mencatat jejak yang tidak bisa diubah untuk: (a) usulan Musrembang, (b) siklus pencairan (submit→verify→disburse/reject), (c) intervensi darurat Kades, (d) hash dokumen untuk pengecekan integritas.

Target network: testnet EVM (Polygon Amoy), pakai Hardhat untuk dev/test/deploy.

## 2. Enum & Struct

```solidity
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
    uint256 paguMaksimal;   // dalam rupiah (atau smallest unit yg disepakati)
    address kaurTeknis;
    bytes32 dokumenHash;    // hash gabungan daftar hadir + notulensi
    uint256 createdAt;
    bytes32 lpjKeuanganHash; // hash LPJ dari bendahara
}

struct Disbursement {
    uint256 id;
    uint256 proposalId;
    uint256 nominal;
    bytes32 beritaAcaraHash; // SHA-256 file berita acara fisik
    string  geotag;          // "lat,lng" - disimpan sbg string untuk kesederhanaan
    DisbursementStatus status;
    address kaurTeknis;
    address sekdesVerifier;
    address kadesApprover;
    string  catatanRevisi;   // diisi kalau status = RETURNED_FOR_REVISION
    uint256 submittedAt;
    uint256 verifiedAt;
    uint256 disbursedAt;
    bytes32 lpjHash;         // hash LPJ Teknis (per pencairan)
    uint256 lpjAmount;       // nominal realisasi LPJ Teknis
}
```

## 3. Fungsi Utama (per role)

| Fungsi | Caller (role) | Efek |
|---|---|---|
| `registerProposal(dusun, kategori, pagu, dokumenHash)` | Operator Desa | Buat `Proposal` baru, emit `ProposalRegistered` |
| `submitDisbursement(proposalId, nominal, beritaAcaraHash, geotag)` | Operator Desa | Cek `nominal <= sisaPagu`, buat `Disbursement` status `PENDING_SEKDES`, emit `DisbursementSubmitted`. Jika nominal > sisa pagu → revert dengan custom error `ExceedsPagu` |
| `verifyBySekdes(disbursementId)` | Sekdes | Ubah status → `PENDING_KADES`, catat `sekdesVerifier` & `verifiedAt`, emit `VerifiedBySekdes` |
| `returnForRevision(disbursementId, catatan)` | Sekdes/Kades | Ubah status → `RETURNED_FOR_REVISION`, simpan `catatanRevisi`, emit `ReturnedForRevision` |
| `authorizeByKades(disbursementId)` | Kades | Ubah status → `PENDING_EKSEKUSI`, catat `kadesApprover`. **Requires**: status sebelumnya harus `PENDING_KADES`. Emit `AuthorizedByKades` |
| `executeDisbursement(disbursementId)` | Kaur Keuangan | Ubah status → `DISBURSED`, catat `disbursedAt` dan update akumulasi pencairan. Emit `Disbursed` |
| `rejectIntervention(disbursementId, reasonHash)` | Kades | "Panic button" — kunci/tolak transaksi, emit `InterventionRejected` (dipakai BPD/Auditor sbg red flag) |
| `submitLpjTeknis(disbursementId, totalAmount, lpjHash)` | Operator Desa | Catat hash dan nominal rincian belanja LPJ per termin pencairan. Emit `LpjTeknisSubmitted` |
| `submitLpjKeuangan(proposalId, lpjHash)` | Kaur Keuangan | Catat hash rekapitulasi keuangan untuk keseluruhan satu program/proposal. Emit `LpjKeuanganSubmitted` |
| `submitLpjDesa(tahun, semester, lpjHash)` | Kades | Catat hash laporan komprehensif seluruh desa per semester/tahunan. Emit `LpjDesaSubmitted` |
| `verifyHash(disbursementId, uploadedHash) view` | Siapapun (Auditor/Sekdes) | Bandingkan `uploadedHash` dgn `beritaAcaraHash` on-chain, return bool — dipakai fitur Hash Checker |
| `getSisaPagu(proposalId) view` | Siapapun | `paguMaksimal - total nominal yang sudah DISBURSED untuk proposal itu` |

## 4. Events (untuk chain-indexer & Ledger Explorer/Timeline)

```solidity
event ProposalRegistered(uint256 indexed proposalId, address indexed kaurTeknis, bytes32 dokumenHash, uint256 timestamp);
event DisbursementSubmitted(uint256 indexed disbursementId, uint256 indexed proposalId, uint256 nominal, uint256 timestamp);
event VerifiedBySekdes(uint256 indexed disbursementId, address indexed sekdes, uint256 timestamp);
event ReturnedForRevision(uint256 indexed disbursementId, string catatan, uint256 timestamp);
event AuthorizedByKades(uint256 indexed disbursementId, address indexed kades, uint256 timestamp);
event Disbursed(uint256 indexed disbursementId, address indexed kaurKeuangan, uint256 timestamp);
event InterventionRejected(uint256 indexed disbursementId, address indexed kades, bytes32 reasonHash, uint256 timestamp);
event LpjTeknisSubmitted(uint256 indexed disbursementId, address indexed kaurTeknis, uint256 totalAmount, bytes32 lpjHash, uint256 timestamp);
event LpjKeuanganSubmitted(uint256 indexed proposalId, address indexed kaurKeuangan, bytes32 lpjHash, uint256 timestamp);
event LpjDesaSubmitted(uint256 indexed tahun, uint8 semester, address indexed kades, bytes32 lpjHash, uint256 timestamp);
```

Setiap event ini yang jadi node di **Timeline Visualisasi Blok** (fitur Auditor: Blok Musrembang ➔ Blok Pengajuan ➔ Blok Persetujuan ➔ Blok Eksekusi).

## 5. Access Control

Pakai OpenZeppelin `AccessControl` dengan role constants:

```solidity
bytes32 public constant KAUR_ROLE = keccak256("KAUR_ROLE");
bytes32 public constant SEKDES_ROLE = keccak256("SEKDES_ROLE");
bytes32 public constant KADES_ROLE = keccak256("KADES_ROLE");
bytes32 public constant KAUR_KEUANGAN_ROLE = keccak256("KAUR_KEUANGAN_ROLE");
```

Address yang di-grant role ini = *custodial wallet address* yang di-generate backend per user (lihat `02_ARCHITECTURE.md` §2), bukan wallet pribadi user.

BPD/Auditor/Publik **tidak** punya role on-chain — mereka hanya baca (via RPC call langsung atau via backend read-only endpoint), sesuai spec "murni read-only, tidak ada tombol setuju/tolak".

## 6. Yang Sengaja TIDAK Disimpan On-Chain

- File asli PDF/foto (terlalu mahal, cukup hash-nya).
- Isi laporan whistleblower (harus E2EE end-to-end, on-chain tidak private).
- Isi chat klarifikasi warga / catatan pengawasan BPD (bukan finansial-kritis, cukup off-chain + timestamp biasa).

## 7. Testing Checklist (Hardhat)

- [ ] `submitDisbursement` revert jika nominal > sisa pagu
- [ ] `disburse` revert jika dipanggil bukan oleh `KADES_ROLE`
- [ ] `disburse` revert jika status bukan `PENDING_KADES`
- [ ] `verifyHash` return `false` untuk hash yang beda 1 karakter pun
- [ ] Event emitted dengan parameter benar untuk tiap transisi status
- [ ] `getSisaPagu` akumulasi benar untuk multi-termin (beberapa disbursement per proposal)
