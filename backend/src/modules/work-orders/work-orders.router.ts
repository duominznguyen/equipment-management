import { Router } from "express";
import * as Controller from "./work-orders.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", roleMiddleware("admin", "technician"), Controller.getAll);
router.get("/:id", roleMiddleware("admin", "technician"), Controller.getById);

router.post("/", roleMiddleware("admin"), Controller.create);
router.post("/from-ticket", roleMiddleware("admin"), Controller.createFromTicket);

router.patch("/:id", roleMiddleware("admin"), Controller.update);
router.patch("/:id/status", roleMiddleware("admin", "technician"), Controller.updateStatus);

router.post("/:id/parts", roleMiddleware("admin", "technician"), Controller.addPartUsage);
router.delete("/parts/:usageId", roleMiddleware("admin", "technician"), Controller.removePartUsage);

router.delete("/:id", roleMiddleware("admin"), Controller.remove);

export default router;
