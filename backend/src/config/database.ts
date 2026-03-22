import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMssql } from "@prisma/adapter-mssql";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaMssql({
  server: "localhost",
  port: 1433,
  database: "EquipmentManagement",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: process.env.SA_PASSWORD,
    },
  },
  options: {
    trustServerCertificate: true,
  },
});

const prisma = new PrismaClient({ adapter });
export default prisma;
