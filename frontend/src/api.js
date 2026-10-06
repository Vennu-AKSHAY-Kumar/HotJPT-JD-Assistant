const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(
  /\/$/,
  ""
);

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Friendly fallback below.
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Something went wrong. Please try again."
    );
  }

  return data;
}

export function analyzeJobDescription(jobDescription) {
  return request("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ jobDescription }),
  });
}

export function askQuestion(question, context) {
  return request("/api/qa", {
    method: "POST",
    body: JSON.stringify({ question, context }),
  });
}

export function getInterviewPrep(context) {
  return request("/api/interview-prep", {
    method: "POST",
    body: JSON.stringify({ context }),
  });
}
