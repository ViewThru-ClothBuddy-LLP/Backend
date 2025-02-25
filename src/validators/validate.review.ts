import { body } from "express-validator";

export const reviewValidator = [
  body("productId").isString().withMessage("Product ID is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString().withMessage("Comment must be a string"),
];
