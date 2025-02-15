import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import router from "./routes/index";

dotenv.config();

const app = express();
const PORT = 3000;

const prisma = new PrismaClient();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database connection check

async function connectDb() {
  try {
    await prisma.$connect();
    console.log("Database connected Successfully");
  } catch (error) {
    console.log("Database Connection error", error);
  }
}

connectDb();

// routes
app.use("/api", router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
