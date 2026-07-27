import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

/**
 * Membuat pasangan kunci (public & secret key) Curve25519 baru.
 * Akan digunakan untuk simulasi keypair milik Inspektorat.
 *
 * @returns Object berisi publicKey dan secretKey dalam format string Base64.
 */
export function generateKeyPair(): { publicKey: string; secretKey: string } {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
}

/**
 * Mengenkripsi teks laporan untuk pihak berwenang tertentu (penerima).
 * Menggunakan nacl.box (Public-key authenticated encryption).
 *
 * Karena kita ingin anonimitas/kepraktisan tanpa key distribution yang rumit,
 * kita membuat *ephemeral keypair* sekali pakai untuk setiap proses enkripsi.
 *
 * @param plaintext Teks rahasia yang ingin dienkripsi
 * @param recipientPublicKeyBase64 Public Key pihak berwenang (Base64)
 * @returns Ciphertext utuh dalam format Base64 (nonce + ephemeral pubkey + data terenkripsi)
 */
export function encryptReport(plaintext: string, recipientPublicKeyBase64: string): string {
  const recipientPublicKey = decodeBase64(recipientPublicKeyBase64);
  
  // 1. Buat ephemeral (sekali pakai) keypair untuk pengirim (sender)
  const ephemeralKeyPair = nacl.box.keyPair();
  
  // 2. Buat random nonce (24 bytes)
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  
  // 3. Ubah string plaintext menjadi Uint8Array (UTF-8)
  const messageUint8 = decodeUTF8(plaintext);
  
  // 4. Enkripsi (nacl.box mengunci pesan dengan public key penerima & private key pengirim sementara)
  const encrypted = nacl.box(
    messageUint8,
    nonce,
    recipientPublicKey,
    ephemeralKeyPair.secretKey
  );
  
  // 5. Susun array gabungan: [nonce (24)] + [ephemeralPublicKey (32)] + [encrypted data]
  const combinedMessage = new Uint8Array(nonce.length + ephemeralKeyPair.publicKey.length + encrypted.length);
  combinedMessage.set(nonce, 0);
  combinedMessage.set(ephemeralKeyPair.publicKey, nonce.length);
  combinedMessage.set(encrypted, nonce.length + ephemeralKeyPair.publicKey.length);
  
  // 6. Kembalikan ke dalam format Base64 utuh
  return encodeBase64(combinedMessage);
}

/**
 * Mendekripsi laporan rahasia (Ciphertext).
 * 
 * @param ciphertextBase64 Ciphertext gabungan dalam format Base64
 * @param recipientSecretKeyBase64 Private/Secret Key milik pihak berwenang (Base64)
 * @returns String plaintext jika berhasil, null jika gagal
 */
export function decryptReport(ciphertextBase64: string, recipientSecretKeyBase64: string): string | null {
  try {
    const combinedMessage = decodeBase64(ciphertextBase64);
    const recipientSecretKey = decodeBase64(recipientSecretKeyBase64);
    
    const nonceLength = nacl.box.nonceLength;       // 24 bytes
    const pubKeyLength = nacl.box.publicKeyLength;  // 32 bytes
    
    // Validasi panjang minimum (nonce + pubkey minimal harus ada walau isi data kosong)
    if (combinedMessage.length < nonceLength + pubKeyLength) {
      return null;
    }
    
    // Ekstraksi komponen pembentuk
    const nonce = combinedMessage.slice(0, nonceLength);
    const ephemeralPublicKey = combinedMessage.slice(nonceLength, nonceLength + pubKeyLength);
    const encrypted = combinedMessage.slice(nonceLength + pubKeyLength);
    
    // Proses buka gembok kriptografi
    const decryptedMessage = nacl.box.open(
      encrypted,
      nonce,
      ephemeralPublicKey,
      recipientSecretKey
    );
    
    // Jika kunci salah / rusak, open() me-return null
    if (!decryptedMessage) {
      return null;
    }
    
    // Ubah kembali dari Uint8Array ke String UTF-8
    return encodeUTF8(decryptedMessage);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
