// write all function here
import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { signinInput, signupInput } from "../validators/validate.user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Create User
const userSignup: RequestHandler = async (req: Request, res: Response) => {
  const validateBody = signupInput.safeParse(req.body);

  if (!validateBody.success) {
    res.status(400).json({
      message: validateBody.error.errors[0].message,
      errors: validateBody.error.errors,
    });
    return;
  }

  try {
    const { email, password, phoneNumber, role } = validateBody.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Check if phone number already exists
    const existingPhone = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingPhone) {
      res.status(400).json({ message: "User with this phone number already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNumber,
      },
    });

    if (role === "buyer") {
      const { address, budget } = validateBody.data;
      await prisma.buyer.create({
        data: {
          user: { connect: { id: user.id } },
          address,
          budget,
        },
      });
    } else if (role === "seller") {
      const { storeName, gstNumber, adharNumber, panCardNumber } = validateBody.data;
      await prisma.seller.create({
        data: {
          user: { connect: { id: user.id } },
          storeName,
          gstNumber,
          adharNumber,
          panCardNumber,
        },
      });
    }

    console.log("User created successfully", user);

    const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error creating user", error);
    res.status(400).json({ message: "Sign-up error", error: (error as Error).message });
  }
};

// signin user

const userSignin: RequestHandler = async (req: Request, res: Response) => {
  const validateBody = signinInput.safeParse(req.body);

  if (!validateBody.success) {
    const errorMessage = validateBody.error.errors[0].message;

    res.status(400).json({
      message: errorMessage,
      errors: validateBody.error.errors,
    });

    return;
  }

  try {
    const { email, password } = validateBody.data;
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        Buyer: true,
        Seller: true,
      },
    });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    const role = user.Buyer ? "buyer" : user.Seller ? "seller" : "unknown";

    const userData = {
      userId: user.id,
      role,
    };

    const token = jwt.sign(userData, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      token,
      role,
    });
  } catch (error) {
    console.error("Sign-in error", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during sign-in. Please try again later.",
    });
  }
};

// get all users

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  try {
    const allUsers = await prisma.user.findMany({
      include: {
        Buyer: true,
        Seller: {
          include: {
            products: true,
          },
        },
      },
    });

    console.log("All users", allUsers);
    if (!allUsers) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    res.status(200).json({ message: "All users", data: allUsers });
  } catch (error) {
    console.error("Error fetching all users", error);
    res.status(500).json({ message: "Error fetching all users", error: (error as Error).message });
  }
};

// get users by id

const getUserById: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Buyer: true,
        Seller: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User found", data: user });
  } catch (error) {
    console.error("Error fetching user", error);
    res.status(500).json({ message: "Error fetching user", error: (error as Error).message });
  }
};

// update user

const updateUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const validateBody = signupInput.safeParse(req.body);

    // check if body is valid
    if (!validateBody.success) {
      res.status(400).json({
        message: validateBody.error.errors[0].message,
        errors: validateBody.error.errors,
      });
      return;
    }
    const { email, password, phoneNumber, role } = validateBody.data;

    // check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // update user details

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        password: hashedPassword,
        phoneNumber,
      },
    });

    if (role === "buyer") {
      const { address, budget } = validateBody.data;
      await prisma.buyer.update({
        where: { userId },
        data: {
          address,
          budget,
        },
      });
    } else if (role === "seller") {
      const { storeName, gstNumber, adharNumber, panCardNumber } = validateBody.data;
      await prisma.seller.update({
        where: { userId },
        data: {
          storeName,
          gstNumber,
          adharNumber,
          panCardNumber,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    console.log("User updated successfully", updatedUser);

    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).json({ message: "Error updating user", error: (error as Error).message });
  }
};

// delete user

const deleteUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // check if user exists

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Delete associated buyer or seller
    await prisma.buyer.deleteMany({ where: { userId } });

    await prisma.seller.deleteMany({ where: { userId } });

    // delete user

    await prisma.user.delete({ where: { id: userId } });

    console.log("User deleted successfully", existingUser);

    res.status(200).json({ message: "User deleted successfully", data: existingUser });
  } catch (error) {
    console.error("Error deleting user", error);
    res.status(500).json({ message: "Error deleting user", error: (error as Error).message });
  }
};

export { userSignup, userSignin, getAllUsers, getUserById, updateUser, deleteUser };
