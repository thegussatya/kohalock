import { Router, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Helper to serialize BigInt
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// GET / - Get user's notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(serialize(notifications));
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET /unread-count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        dibaca: false
      }
    });

    res.json({ count });
  } catch (error: any) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /:id/read - Mark notification as read
router.post('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ error: 'Akses ditolak' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { dibaca: true }
    });

    res.json(serialize(updated));
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
