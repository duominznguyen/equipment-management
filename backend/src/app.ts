import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./modules/auth/auth.router.js";
import usersRouter from "./modules/users/users.router.js";
import customersRouter from "./modules/customers/customers.router.js";
import techniciansRouter from "./modules/technicians/technicians.router.js";
import deviceCategoriesRouter from "./modules/device-categories/device-categories.router.js";
import devicesRouter from "./modules/devices/devices.router.js";
import warrantyContractsRouter from "./modules/warranty-contracts/warranty-contracts.router.js";
import ticketsRouter from "./modules/tickets/tickets.router.js";
import maintenanceSchedulesRouter from "./modules/maintenance-schedules/maintenance-schedules.router.js";
import partsRouter from "./modules/parts/parts.router.js";
import partImportsRouter from "./modules/part-imports/part-imports.router.js";
import workOrdersRouter from "./modules/work-orders/work-orders.router.js";
import reportsRouter from "./modules/reports/reports.router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/customers", customersRouter);
app.use("/technicians", techniciansRouter);
app.use("/device-categories", deviceCategoriesRouter);
app.use("/devices", devicesRouter);
app.use("/warranty-contracts", warrantyContractsRouter);
app.use("/tickets", ticketsRouter);
app.use("/maintenance-schedules", maintenanceSchedulesRouter);
app.use("/parts", partsRouter);
app.use("/part-imports", partImportsRouter);
app.use("/work-orders", workOrdersRouter);
app.use("/reports", reportsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
