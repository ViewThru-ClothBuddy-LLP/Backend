import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { productSchema } from "../validators/product.validators";

const prisma = new PrismaClient();

// Create Product

const addProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = productSchema.safeParse(req.body);

    if (!validatedData.success) {
      res.status(400).json({
        message: validatedData.error.errors[0].message,
        errors: validatedData.error.errors,
      });
      return;
    }
    const seller = await prisma.seller.findFirst({
      where: {
        id: validatedData.data.sellerId,
        userId: req.user?.userId,
      },
    });

    if (!seller) {
      res.status(404).json({ message: "Seller not found" });
      return;
    }
    console.log("Seller", seller);

    const newProduct = await prisma.product.create({
      data: {
        title: validatedData.data.title,
        description: validatedData.data.description,
        price: validatedData.data.price,
        sellerId: validatedData.data.sellerId,
        productDetails: validatedData.data.productDetails
          ? {
              create: {
                fabricType: validatedData.data.productDetails.fabricType
                  ? Object.entries(validatedData.data.productDetails.fabricType || {}).map(([key, value]) => ({
                      key,
                      value,
                    }))
                  : [],

                origin: validatedData.data.productDetails.origin ?? "",
                closureType: validatedData.data.productDetails.closureType ?? "",
                countryOfOrigin: validatedData.data.productDetails.countryOfOrigin ?? "",
              },
            }
          : undefined,
        variants: validatedData.data.variants?.length
          ? {
              create: validatedData.data.variants.map((variant) => ({
                color: variant.color ?? "",
                size: variant.size ?? "",
                stock: variant.stock ?? 0,
              })),
            }
          : undefined,

        images: validatedData.data.images?.length
          ? {
              create: validatedData.data.images.map((image) => ({
                url: image.url ?? "",
              })),
            }
          : undefined,
      },
      include: {
        productDetails: true,
        variants: true,
        images: true,
      },
    });
    if (!newProduct) {
      res.status(400).json({ message: "Error creating product" });
      return;
    }

    console.log("New Product", newProduct);

    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
    console.error("Error creating product", error);
    res.status(500).json({ message: "Error creating product", error: (error as Error).message });
  }
};

// update product
const updateProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }

    const validatedData = productSchema.safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({
        message: validatedData.error.errors[0].message,
        errors: validatedData.error.errors,
      });
      return;
    }

    // Validate seller exists & belongs to authenticated user
    const seller = await prisma.seller.findFirst({
      where: {
        id: validatedData.data.sellerId,
        userId: req.user?.userId,
      },
    });

    if (!seller) {
      res.status(404).json({ message: "Seller not found or unauthorized" });
      return;
    }

    // Validate product exists and belongs to the seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id, // Ensure the product belongs to this seller
      },
    });

    if (!existingProduct) {
      res.status(404).json({ message: "Product not found or unauthorized" });
      return;
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: validatedData.data?.title,
        description: validatedData.data?.description,
        price: validatedData.data?.price,

        productDetails: validatedData.data?.productDetails
          ? {
              upsert: {
                create: {
                  fabricType: validatedData.data.productDetails.fabricType
                    ? Object.entries(validatedData.data.productDetails.fabricType).map(([key, value]) => ({
                        key,
                        value,
                      }))
                    : [],
                  origin: validatedData.data.productDetails.origin ?? "",
                  closureType: validatedData.data.productDetails.closureType ?? "",
                  countryOfOrigin: validatedData.data.productDetails.countryOfOrigin ?? "",
                },
                update: {
                  fabricType: validatedData.data.productDetails.fabricType
                    ? Object.entries(validatedData.data.productDetails.fabricType).map(([key, value]) => ({
                        key,
                        value,
                      }))
                    : [],
                  origin: validatedData.data.productDetails.origin ?? "",
                  closureType: validatedData.data.productDetails.closureType ?? "",
                  countryOfOrigin: validatedData.data.productDetails.countryOfOrigin ?? "",
                },
              },
            }
          : undefined,

        variants: validatedData.data?.variants?.length
          ? {
              deleteMany: {},
              create: validatedData.data.variants.map((variant) => ({
                color: variant.color ?? "",
                size: variant.size ?? "",
                stock: variant.stock ?? 0,
              })),
            }
          : undefined,

        images: validatedData.data?.images?.length
          ? {
              deleteMany: {},
              create: validatedData.data.images.map((image) => ({
                url: image.url ?? "",
              })),
            }
          : undefined,
      },
      include: {
        productDetails: true,
        variants: true,
        images: true,
      },
    });

    res.status(200).json({ message: "Product updated", data: updatedProduct });
    return;
  } catch (error) {
    console.error("Error updating product", error);
    res.status(500).json({ message: "Error updating product", error: (error as Error).message });
    return;
  }
};
// get product by seller id

const getProductBySellerId: RequestHandler = async (req: Request, res: Response) => {
  try {
    const sellerId = parseInt(req.params.id);
    if (isNaN(sellerId)) {
      res.status(400).json({ message: "Invalid seller ID" });
      return;
    }

    //find the seller first to check if the seller exists
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { userId: true },
    });

    if (!seller) {
      res.status(404).json({ message: "Seller not found" });
      return;
    }

    if (req.user?.userId !== seller.userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    // fetch the products of the seller only if authorized
    const products = await prisma.product.findMany({
      where: { sellerId },
      include: {
        productDetails: true,
        variants: true,
        images: true,
      },
    });

    if (!products) {
      res.status(404).json({ message: "No products found" });
      return;
    }

    res.status(200).json({ message: "Products found", data: products });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).json({ message: "Error fetching products", error: (error as Error).message });
  }
};

// get product by id

const getProductById: RequestHandler = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }

    // first fetch only the sellerId of the product to check if the product belongs to the authenticated user

    const productSeller = await prisma.product.findFirst({
      where: { id: productId },
      select: { sellerId: true },
    });

    if (!productSeller) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // check if the product belongs to the authenticated user

    const seller = await prisma.seller.findUnique({
      where: { id: productSeller.sellerId },
      select: { userId: true },
    });

    if (!seller || seller.userId !== req.user?.userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    // fetch the complete product details

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productDetails: true,
        variants: true,
        images: true,
        seller: true,
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ message: "Product found", data: product });
  } catch (error) {
    console.error("Error fetching product", error);
    res.status(500).json({ message: "Error fetching product", error: (error as Error).message });
  }
};

// get all products

const getAllProducts: RequestHandler = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        productDetails: true,
        variants: true,
        images: true,
        seller: true,
      },
    });

    if (!products) {
      res.status(404).json({ message: "No products found" });
      return;
    }

    res.status(200).json({ message: "All products", data: products });
  } catch (error) {
    console.error("Error fetching all products", error);
    res.status(500).json({ message: "Error fetching all products", error: (error as Error).message });
  }
};

// delete product

const deleteProduct: RequestHandler = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }

    // Check if product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (req.user?.userId !== product.seller.userId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    // Delete related records first
    await prisma.productDetails.deleteMany({ where: { productId } });
    await prisma.productVariant.deleteMany({ where: { productId } });
    await prisma.productImage.deleteMany({ where: { productId } });

    // Now delete the product
    const deletedProduct = await prisma.product.delete({ where: { id: productId } });

    res.status(200).json({ message: "Product deleted", data: deletedProduct });
  } catch (error) {
    console.error("Error deleting product", error);
    res.status(500).json({ message: "Error deleting product", error: (error as Error).message });
  }
};

export { addProduct, updateProduct, getProductBySellerId, getProductById, getAllProducts, deleteProduct };
