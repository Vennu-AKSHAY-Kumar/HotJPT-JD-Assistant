import {
  analyzeJD,
  answerFromGroundedContext,
  buildInterviewPrep,
  validateClientContext,
} from "../services/groundingService.js";

const MIN_JD_LENGTH = 80;

export async function analyzeJobDescription(req, res, next) {
  try {
    const jobDescription = String(req.body?.jobDescription || "").trim();

    if (!jobDescription) {
      return res
        .status(400)
        .json({ error: "Please paste a job description before continuing." });
    }

    if (jobDescription.length < MIN_JD_LENGTH) {
      return res.status(400).json({
        error:
          "This job description looks too short. Please paste the full posting.",
      });
    }

    const context = await analyzeJD(jobDescription);

    return res.json({
      message: "Job description analyzed.",
      context,
    });
  } catch (error) {
    next(error);
  }
}

export async function answerQuestion(req, res, next) {
  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ error: "Please enter a question." });
    }

    const context = validateClientContext(req.body?.context);
    const result = await answerFromGroundedContext(context, question);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateInterviewPrep(req, res, next) {
  try {
    const context = validateClientContext(req.body?.context);
    const result = await buildInterviewPrep(context);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}
