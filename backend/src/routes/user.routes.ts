import { Router } from "express";

import * as userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { createUserSchema, updateUserSchema, usuarioIdSchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate, authorize("ADMINISTRADOR"));
router.get("/", asyncHandler(userController.getUsers));
router.get("/:id", validate(usuarioIdSchema), asyncHandler(userController.getUser));
router.post("/", validate(createUserSchema), asyncHandler(userController.createUser));
router.put("/:id", validate(usuarioIdSchema.merge(updateUserSchema)), asyncHandler(userController.updateUser));
router.delete("/:id", validate(usuarioIdSchema), asyncHandler(userController.deleteUser));

export default router;
