import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const FeedbackService = {
  async createFeedback(userId: string, message: string, imageUrl?: string) {
    return await prisma.feedback.create({
      data: {
        userId,
        message,
        imageUrl,
      },
    });
  },

  async getAllFeedbacks() {
    return await prisma.feedback.findMany({
      include: { user: true },
    });
  },
};
