// write all routes of controller here
// make a proper file structure and write route for your project routes folder.

// routes/index.ts
// routes/user.route.ts
// routes/product.route.ts
// make a proper file structure and write route for your project routes folder.

import express from "express";
import userRoutes from "./user.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import productRoutes from "./products.routes";
import reviewRoutes from "./review.routes";
import feedbackRoutes from "./feedback.routes";

const router = express.Router();

//user routes
router.use("/user", userRoutes);
//cart routes
router.use("/carts", cartRoutes);
// order routes
router.use("/orders", orderRoutes);
// product routes
router.use("/products", productRoutes);
// review routes
router.use("/reviews", reviewRoutes);
// feedback routes
router.use("/feedbacks", feedbackRoutes);
export default router;
