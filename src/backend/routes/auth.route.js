import express from "express";
import authController from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validator.js";
import { userSchema } from "../libs/schemas/user.schema.js";

const router = express.Router();

router.post("/login", auth, authController.login);
router.post("/register", validate(userSchema), authController.register);

export default router;
