function QuestionCard({ item, index }) {
  return (
    <article className="interview-question">
      <div className="question-number">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <h4>{item.question}</h4>
        <p>
          <strong>Why this question:</strong> {item.reason}
        </p>
      </div>
    </article>
  );
}

export default QuestionCard;
