import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  userSignin,
  userSignup,
} from "../controllers/auth.controller";

const userRoutes = Router();

userRoutes.post("/signup", userSignup);
userRoutes.post("/signin", userSignin);
userRoutes.get("/get-all-user", getAllUsers);
userRoutes.get("/:id", getUserById);
userRoutes.put("/update-user/:id", updateUser);
userRoutes.delete("/:id", deleteUser);

export default userRoutes;
