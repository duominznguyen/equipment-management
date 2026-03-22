import { Router } from "express";
import {
  getAll,
  getById,
  getMyTickets,
  create,
  updateStatus,
  remove,
} from "./tickets.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("admin", "technician"), getAll);
router.get("/my", authMiddleware, roleMiddleware("customer"), getMyTickets);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "technician", "customer"),
  getById,
);
router.post("/", authMiddleware, roleMiddleware("customer"), create);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "technician"),
  updateStatus,
);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), remove);

export default router;
