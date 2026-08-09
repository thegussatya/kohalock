import express from 'express';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { decryptPrivateKey, encryptPrivateKey } from '../src/services/crypto.service';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET belum di-set di .env');
}

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password harus diisi" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        nama: user.nama,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        role: user.role,
        jabatan: user.jabatan,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// Middleware for authenticating token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Token otentikasi tidak ditemukan" });
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token tidak valid atau kadaluarsa" });
    req.user = user;
    next();
  });
};

router.get('/me', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, nama: true, role: true, email: true, jabatan: true }
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan internal" });
  }
});

router.put('/change-pin', authenticateToken, async (req: any, res: any) => {
  try {
    const { oldPin, newPin } = req.body;
    
    if (!oldPin || !newPin || newPin.length < 6) {
      return res.status(400).json({ error: "PIN baru minimal 6 karakter" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
    if (!user || !user.passwordHash) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    
    const isMatch = await bcrypt.compare(oldPin, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "PIN lama tidak sesuai" });
    }
    
    const newPasswordHash = await bcrypt.hash(newPin, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });
    
    res.json({ message: "PIN berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan saat mengubah PIN" });
  }
});

router.put('/change-wallet-pin', authenticateToken, async (req: any, res: any) => {
  try {
    const { oldPin, newPin } = req.body;
    
    if (!oldPin || !newPin || newPin.length < 6) {
      return res.status(400).json({ error: "PIN baru minimal 6 karakter" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
    if (!user || !user.encryptedPrivateKey) {
      return res.status(404).json({ error: "User wallet tidak ditemukan" });
    }
    
    let privateKey: string;
    try {
      privateKey = decryptPrivateKey(user.encryptedPrivateKey, oldPin);
    } catch (err) {
      return res.status(401).json({ error: "PIN lama tidak sesuai atau gagal dekripsi" });
    }
    
    const newEncryptedPrivateKey = encryptPrivateKey(privateKey, newPin);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { encryptedPrivateKey: newEncryptedPrivateKey }
    });
    
    res.json({ message: "Wallet PIN berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan saat mengubah Wallet PIN" });
  }
});

export default router;
