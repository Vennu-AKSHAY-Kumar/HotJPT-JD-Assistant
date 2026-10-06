import LoadingState from "./LoadingState.jsx";
import QuestionCard from "./QuestionCard.jsx";

function InterviewGroup({ title, subtitle, items }) {
  return (
    <section className="interview-group">
      <div className="group-heading">
        <h4>{title}</h4>
        <span>{subtitle}</span>
      </div>

      {items.length ? (
        <div className="question-list">
          {items.map((item, index) => (
            <QuestionCard
              key={`${title}-${index}-${item.question}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className="muted">
          The JD did not provide enough grounded material for this category.
        </p>
      )}
    </section>
  );
}

function InterviewPrep({ data, loading, error, onGenerate }) {
  return (
    <div className="tool-panel">
      <div className="interview-topline">
        <div className="tool-heading">
          <span className="step-label">03</span>
          <h3>Interview preparation</h3>
          <p>
            Focused questions derived from explicit responsibilities, skills,
            qualifications, and expectations in the JD.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "Preparing..." : data ? "Regenerate" : "Generate Interview Prep"}
        </button>
      </div>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {loading && <LoadingState text="Preparing interview questions..." />}

      {!data && !loading && (
        <div className="empty-state interview-empty">
          <strong>Ready when you are.</strong>
          <span>
            Generate a concise set of JD-specific interview questions.
          </span>
        </div>
      )}

      {data && (
        <div className="interview-grid">
          <InterviewGroup
            title="Technical"
            subtitle="Skills, technologies, and technical responsibilities"
            items={data.technical || []}
          />
          <InterviewGroup
            title="Behavioral"
            subtitle="Collaboration, ownership, communication, and working style"
            items={data.behavioral || []}
          />
          <InterviewGroup
            title="Role-Specific"
            subtitle="How you would perform the actual work described"
            items={data.roleSpecific || []}
          />
        </div>
      )}
    </div>
  );
}

export default InterviewPrep;
