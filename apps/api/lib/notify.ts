import { PrismaClient } from '../generated/prisma';

export async function createNotification(
  prisma: PrismaClient,
  userId: string,
  judul: string,
  pesan: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        judul,
        pesan,
        dibaca: false
      }
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null; // Silent fail so it doesn't break main business flows
  }
}
