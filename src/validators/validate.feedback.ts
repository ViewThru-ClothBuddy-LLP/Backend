import { body } from "express-validator";

export const feedbackValidator = [body("message").isString().notEmpty().withMessage("Message is required")];
