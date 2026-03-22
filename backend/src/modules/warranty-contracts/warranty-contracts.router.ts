import { Router } from "express";
import {
  getAll,
  getById,
  getByCustomer,
  create,
  update,
  remove,
} from "./warranty-contracts.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("admin"), getAll);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "customer"),
  getById,
);
router.get(
  "/customer/:customerId",
  authMiddleware,
  roleMiddleware("admin", "customer"),
  getByCustomer,
);
router.post("/", authMiddleware, roleMiddleware("admin"), create);
router.put("/:id", authMiddleware, roleMiddleware("admin"), update);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), remove);

export default router;
