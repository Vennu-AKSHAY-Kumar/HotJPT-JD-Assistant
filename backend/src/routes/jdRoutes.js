import { Router } from "express";
import {
  analyzeJobDescription,
  answerQuestion,
  generateInterviewPrep,
} from "../controllers/jdController.js";

const router = Router();

router.post("/analyze", analyzeJobDescription);
router.post("/qa", answerQuestion);
router.post("/interview-prep", generateInterviewPrep);

export default router;
