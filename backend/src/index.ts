import express, { Application } from "express";
import cors from "cors";
import patientRoutes from "./routes/patientRoutes";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/api", patientRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
