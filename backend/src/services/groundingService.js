import { generateStructured } from "./geminiService.js";
import {
  buildAnalysisPrompt,
  buildInterviewPrompt,
  buildQAPrompt,
} from "../prompts/jdPrompts.js";

const analysisSchema = {
  type: "object",
  properties: {
    overview: { type: "string" },
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          statement: { type: "string" },
          evidence: { type: "string" },
        },
        required: ["category", "statement", "evidence"],
      },
    },
  },
  required: ["overview", "keywords", "facts"],
};

const qaSchema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    grounded: { type: "boolean" },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          reason: { type: "string" },
        },
        required: ["text", "reason"],
      },
    },
  },
  required: ["answer", "grounded", "evidence"],
};

const interviewItemSchema = {
  type: "object",
  properties: {
    question: { type: "string" },
    reason: { type: "string" },
    evidence: { type: "string" },
  },
  required: ["question", "reason", "evidence"],
};

const interviewSchema = {
  type: "object",
  properties: {
    technical: {
      type: "array",
      items: interviewItemSchema,
    },
    behavioral: {
      type: "array",
      items: interviewItemSchema,
    },
    roleSpecific: {
      type: "array",
      items: interviewItemSchema,
    },
  },
  required: ["technical", "behavioral", "roleSpecific"],
};

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
    .toLowerCase();
}

function exactEvidenceExists(source, evidence) {
  const normalizedSource = normalizeText(source);
  const normalizedEvidence = normalizeText(evidence);

  return (
    normalizedEvidence.length >= 3 &&
    normalizedSource.includes(normalizedEvidence)
  );
}

function uniqueBy(items, keyFn) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function analyzeJD(jobDescription) {
  const raw = await generateStructured({
    prompt: buildAnalysisPrompt(jobDescription),
    schema: analysisSchema,
    maxOutputTokens: 7000,
  });

  const facts = uniqueBy(
    (Array.isArray(raw.facts) ? raw.facts : [])
      .map((fact) => ({
        category: String(fact.category || "").trim(),
        statement: String(fact.statement || "").trim(),
        evidence: String(fact.evidence || "").trim(),
      }))
      .filter(
        (fact) =>
          fact.category &&
          fact.statement &&
          fact.evidence &&
          exactEvidenceExists(jobDescription, fact.evidence)
      ),
    (fact) => `${normalizeText(fact.statement)}|${normalizeText(fact.evidence)}`
  );

  if (!facts.length) {
    const error = new Error(
      "I could not build reliable grounded context from this posting. Please check the JD and try again."
    );
    error.status = 422;
    throw error;
  }

  const keywords = uniqueBy(
    (Array.isArray(raw.keywords) ? raw.keywords : [])
      .map((keyword) => String(keyword || "").trim())
      .filter(Boolean),
    (keyword) => normalizeText(keyword)
  ).slice(0, 30);

  return {
    overview: String(raw.overview || "").trim(),
    keywords,
    facts,
  };
}

export function validateClientContext(context) {
  if (!context || !Array.isArray(context.facts) || context.facts.length === 0) {
    const error = new Error(
      "Please analyze a job description before continuing."
    );
    error.status = 400;
    throw error;
  }

  const facts = context.facts
    .map((fact) => ({
      category: String(fact?.category || "").trim(),
      statement: String(fact?.statement || "").trim(),
      evidence: String(fact?.evidence || "").trim(),
    }))
    .filter((fact) => fact.category && fact.statement && fact.evidence)
    .slice(0, 180);

  if (!facts.length) {
    const error = new Error(
      "The analyzed job description context is invalid. Please analyze the JD again."
    );
    error.status = 400;
    throw error;
  }

  return {
    overview: String(context.overview || "").trim().slice(0, 1500),
    keywords: Array.isArray(context.keywords)
      ? context.keywords.map(String).slice(0, 30)
      : [],
    facts,
  };
}

function allowedEvidenceSet(context) {
  return new Map(
    context.facts.map((fact) => [normalizeText(fact.evidence), fact.evidence])
  );
}

export async function answerFromGroundedContext(context, question) {
  const result = await generateStructured({
    prompt: buildQAPrompt(context, question),
    schema: qaSchema,
    maxOutputTokens: 1600,
  });

  if (!result.grounded) {
    return {
      answer: "Not stated in this posting.",
      grounded: false,
      evidence: [],
    };
  }

  const allowed = allowedEvidenceSet(context);

  const evidence = uniqueBy(
    (Array.isArray(result.evidence) ? result.evidence : [])
      .map((item) => {
        const normalized = normalizeText(item?.text);
        const canonicalText = allowed.get(normalized);

        if (!canonicalText) return null;

        return {
          text: canonicalText,
          reason: String(item?.reason || "").trim(),
        };
      })
      .filter(Boolean),
    (item) => normalizeText(item.text)
  );

  if (!evidence.length) {
    return {
      answer: "Not stated in this posting.",
      grounded: false,
      evidence: [],
    };
  }

  return {
    answer: String(result.answer || "").trim() || "Not stated in this posting.",
    grounded: true,
    evidence,
  };
}

function validateInterviewItems(items, context, maxItems) {
  const allowed = allowedEvidenceSet(context);

  return uniqueBy(
    (Array.isArray(items) ? items : [])
      .map((item) => {
        const question = String(item?.question || "").trim();
        const reason = String(item?.reason || "").trim();
        const normalizedEvidence = normalizeText(item?.evidence);
        const canonicalEvidence = allowed.get(normalizedEvidence);

        if (!question || !reason || !canonicalEvidence) return null;

        return {
          question,
          reason,
          evidence: canonicalEvidence,
        };
      })
      .filter(Boolean),
    (item) => normalizeText(item.question)
  ).slice(0, maxItems);
}

export async function buildInterviewPrep(context) {
  const result = await generateStructured({
    prompt: buildInterviewPrompt(context),
    schema: interviewSchema,
    maxOutputTokens: 4500,
  });

  return {
    technical: validateInterviewItems(result.technical, context, 5).map(
      ({ question, reason }) => ({ question, reason })
    ),
    behavioral: validateInterviewItems(result.behavioral, context, 4).map(
      ({ question, reason }) => ({ question, reason })
    ),
    roleSpecific: validateInterviewItems(result.roleSpecific, context, 4).map(
      ({ question, reason }) => ({ question, reason })
    ),
  };
}
