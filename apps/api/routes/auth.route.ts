import express from 'express';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export default router;
