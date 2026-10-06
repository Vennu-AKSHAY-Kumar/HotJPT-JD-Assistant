import { useState } from "react";
import EvidenceCard from "./EvidenceCard.jsx";
import LoadingState from "./LoadingState.jsx";

const suggestedQuestions = [
  "Is this role remote?",
  "What technologies are required?",
  "What are the main responsibilities?",
  "What experience is required?",
];

function QASection({ history, loading, error, onAsk }) {
  const [question, setQuestion] = useState("");
  const [validationError, setValidationError] = useState("");

  async function submitQuestion(event) {
    event?.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setValidationError("Please enter a question.");
      return;
    }

    setValidationError("");
    await onAsk(cleanQuestion);
    setQuestion("");
  }

  function useSuggestion(value) {
    setQuestion(value);
    setValidationError("");
  }

  return (
    <div className="tool-panel">
      <div className="tool-heading">
        <span className="step-label">02</span>
        <h3>Ask about this JD</h3>
        <p>Answers are limited to information supported by the posting.</p>
      </div>

      <div className="suggestions" aria-label="Suggested questions">
        {suggestedQuestions.map((item) => (
          <button key={item} onClick={() => useSuggestion(item)} disabled={loading}>
            {item}
          </button>
        ))}
      </div>

      <form className="question-form" onSubmit={submitQuestion}>
        <label htmlFor="question">Ask a question about this job description</label>
        <div className="question-row">
          <input
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. Do they mention visa sponsorship?"
            disabled={loading}
          />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Finding..." : "Ask"}
          </button>
        </div>
      </form>

      {validationError && (
        <div className="alert error" role="alert">
          {validationError}
        </div>
      )}

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <LoadingState text="Finding the answer in the job description..." />
      )}

      <div className="qa-history">
        {history.length === 0 && !loading ? (
          <div className="empty-state">
            <strong>No questions yet.</strong>
            <span>Ask something specific about the posting.</span>
          </div>
        ) : (
          [...history].reverse().map((item) => (
            <article className="answer-card" key={item.id}>
              <div className="question-label">Question</div>
              <h4>{item.question}</h4>

              <div className="answer-label">Answer</div>
              <p className={item.grounded ? "answer-text" : "answer-text not-stated"}>
                {item.answer}
              </p>

              {item.grounded &&
                item.evidence.map((evidence, index) => (
                  <EvidenceCard
                    key={`${item.id}-${index}`}
                    evidence={evidence}
                  />
                ))}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default QASection;
