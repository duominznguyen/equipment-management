import { Router } from "express";
import {
  getAll,
  getById,
  getMySchedules,
  create,
  update,
  updateStatus,
  remove,
} from "./maintenance-schedules.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("admin", "technician"), getAll);
router.get("/my", authMiddleware, roleMiddleware("customer"), getMySchedules);
router.get("/:id", authMiddleware, roleMiddleware("admin", "technician", "customer"), getById);
router.post("/", authMiddleware, roleMiddleware("admin"), create);
router.put("/:id", authMiddleware, roleMiddleware("admin"), update);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin", "technician"), updateStatus);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), remove);

export default router;
