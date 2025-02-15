import { z } from "zod";

// ProductDetails Schema (Optional)
export const productDetailsSchema = z
  .object({
    productId: z.number().int().positive(),
    fabricType: z.record(z.string(), z.string()).optional(),
    origin: z.string().min(2).optional(),
    closureType: z.string().min(2).optional(),
    countryOfOrigin: z.string().min(2).optional(),
  })
  .partial();

// ProductVariant Schema (Optional)
export const productVariantSchema = z
  .object({
    productId: z.number().int().positive(),
    color: z.string().min(3).optional(),
    size: z.string().min(1).optional(),
    stock: z.number().int().nonnegative().optional(),
  })
  .partial();

// ProductImage Schema (Optional)
export const productImageSchema = z
  .object({
    productId: z.number().int().positive(),
    url: z.string().url("Invalid URL format"),
  })
  .partial();

// Product Schema (Main)
export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  sellerId: z.number().int().positive(),
  productDetails: productDetailsSchema.optional(),
  variants: z.array(productVariantSchema).optional(),
  images: z.array(productImageSchema).optional(),
});

// Exporting types
export type ProductType = z.infer<typeof productSchema>;
export type ProductDetailsType = z.infer<typeof productDetailsSchema>;
export type ProductVariantType = z.infer<typeof productVariantSchema>;
export type ProductImageType = z.infer<typeof productImageSchema>;
