import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export class ProductController {
  // Create a new product
  static async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.user.id);
      const product = await ProductService.createProduct(userId, req.body);
      res.status(201).json({
        message: "Create Product Successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating product",
        error: error,
      });
    }
  }

  // Update product
  static async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.user.id);
      const productId = req.params.id;
      const updatedProduct = await ProductService.updateProduct(productId, userId, req.body);
      if (!updatedProduct)
        return res.status(404).json({
          error: "Product not found or not authorized",
        });
      res.status(200).json({
        message: "Update product successfully",
        updatedProduct,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating product",
        error: error,
      });
    }
  }

  // Delete product
  static async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = req.params.id;
      const userId = parseInt(req.user.id);
      const deletedProduct = await ProductService.deleteProduct(productId, userId);

      if (!deletedProduct) {
        return res.status(404).json({
          message: "Product not found or unauthorized",
        });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message: "Error deleting product",
        error: error,
      });
    }
  }

  // List all products
  static async getAllProducts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const products = await ProductService.getAllProducts(Number(page), Number(limit), category as string);
      res.status(200).json({
        message: "All Products fetched successfully",
        products,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching products",
        error: error,
      });
    }
  }

  // Get product details
  static async getProductById(req: Request, res: Response) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product)
        return res.status(404).json({
          error: "Product not found",
        });
      res.status(200).json({
        message: "product fetched successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching product details",
        error: error,
      });
    }
  }

  static async getAllProductsBySellerId(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const sellerId = parseInt(req.user.id);
      const { page = 1, limit = 10 } = req.query;
      const products = await ProductService.getAllProductsBySellerId(sellerId, Number(page), Number(limit));

      res.status(200).json({
        message: "Products Fetched successfully",
        products,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch seller's products",
        error: error,
      });
    }
  }
}
