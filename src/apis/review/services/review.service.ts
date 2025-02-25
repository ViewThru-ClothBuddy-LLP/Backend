import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ReviewService = {
  async createReview(userId: string, productId: string, rating: number, comment?: string, imageUrl?: string) {
    return await prisma.review.create({
      data: {
        userId: Number(userId),
        productId,
        rating,
        comment,
        imageUrl,
      },
    });
  },

  async getReviewsByProduct(productId: string) {
    return await prisma.review.findMany({
      where: { productId },
      include: { user: true },
    });
  },
};
