import express from "express";
import problemController from "../controllers/problemController";

const router = express.Router();

router.get("/routes/problems", problemController.getProblems)

console.log(getProblems)

export default router;