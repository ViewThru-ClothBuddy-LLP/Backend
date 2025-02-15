import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductBySellerId,
  updateProduct,
} from "../controllers/product.routes.controller";
import { authorizeRole } from "../middleware/auth.middleware";

const productRoutes = Router();

productRoutes.post("/add-product", authorizeRole("seller"), addProduct);
productRoutes.post("/update-product/:id", authorizeRole("seller"), updateProduct);
productRoutes.get("/seller/:id", authorizeRole("seller"), getProductBySellerId);
productRoutes.get("/get-product-by-id/:id", authorizeRole("seller"), getProductById);
productRoutes.delete("/delete-product/:id", authorizeRole("seller"), deleteProduct);
productRoutes.get("/get-all-products", getAllProducts);

export default productRoutes;
