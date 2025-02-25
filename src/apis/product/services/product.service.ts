import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  discount: number;
  description: string;
  category: string;
  // Add other product fields as needed
}

interface UpdateProductData {
  name?: string;
  price?: number;
  stock?: number;
  discount?: number;
  description?: string;
  category?: string;
  // Add other product fields as needed
}

export class ProductService {
  static async createProduct(sellerId: number, data: CreateProductData) {
    return await prisma.product.create({
      data: { ...data, sellerId },
    });
  }

  static async updateProduct(productId: string, sellerId: number, data: UpdateProductData) {
    return await prisma.product.update({
      where: { id: productId, sellerId },
      data,
    });
  }

  static async deleteProduct(productId: string, sellerId: number) {
    return await prisma.product.delete({
      where: { id: productId, sellerId },
    });
  }

  static async getAllProducts(page: number, limit: number, category?: string) {
    const filters: Prisma.ProductWhereInput = {};
    if (category) filters.category = category;

    return await prisma.product.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  // Fetch all products by seller ID
  static async getAllProductsBySellerId(sellerId: number, page: number, limit: number) {
    return await prisma.product.findMany({
      where: { sellerId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getProductById(productId: string) {
    return await prisma.product.findUnique({ where: { id: productId } });
  }
}
