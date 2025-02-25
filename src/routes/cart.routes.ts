/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { CartController } from "../apis/cart/controller/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", authMiddleware, asyncHandler(CartController.getCart));
router.post("/add", authMiddleware, asyncHandler(CartController.addToCart));
router.post("/remove", authMiddleware, asyncHandler(CartController.removeFromCart));

export default router;
