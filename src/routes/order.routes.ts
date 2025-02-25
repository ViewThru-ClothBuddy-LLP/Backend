/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { OrderController } from "../apis/order/controller/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

router.post("/create", authMiddleware, asyncHandler(OrderController.createOrder));
router.get("/my-orders", authMiddleware, asyncHandler(OrderController.getUserOrders));
router.patch("/:orderId/status", authMiddleware, asyncHandler(OrderController.updateOrderStatus));

export default router;
