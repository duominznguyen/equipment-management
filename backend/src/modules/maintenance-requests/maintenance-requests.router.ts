import { Router } from "express";
import { getAll, getById, create, createFromTicket, update, updateStatus } from "./maintenance-requests.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("admin", "technician"), getAll);
router.get("/:id", authMiddleware, roleMiddleware("admin", "technician"), getById);
router.post("/", authMiddleware, roleMiddleware("admin"), create);
router.post("/from-ticket/:ticketId", authMiddleware, roleMiddleware("admin"), createFromTicket);
router.put("/:id", authMiddleware, roleMiddleware("admin", "technician"), update);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin", "technician"), updateStatus);

export default router;
