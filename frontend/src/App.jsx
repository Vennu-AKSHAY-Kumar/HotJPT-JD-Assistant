import { useState } from "react";
import Header from "./components/Header.jsx";
import JDInput from "./components/JDInput.jsx";
import QASection from "./components/QASection.jsx";
import InterviewPrep from "./components/InterviewPrep.jsx";
import {
  analyzeJobDescription,
  askQuestion,
  getInterviewPrep,
} from "./api.js";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [context, setContext] = useState(null);
  const [activeTab, setActiveTab] = useState("qa");

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");
  const [qaHistory, setQaHistory] = useState([]);

  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const [interviewData, setInterviewData] = useState(null);

  async function handleAnalyze() {
    const cleanJD = jobDescription.trim();

    if (!cleanJD) {
      setAnalysisError("Please paste a job description before continuing.");
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError("");

    try {
      const data = await analyzeJobDescription(cleanJD);
      setContext(data.context);
      setQaHistory([]);
      setInterviewData(null);
      setActiveTab("qa");
    } catch (error) {
      setAnalysisError(error.message);
      setContext(null);
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleAsk(question) {
    setQaLoading(true);
    setQaError("");

    try {
      const data = await askQuestion(question, context);
      setQaHistory((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          question,
          ...data,
        },
      ]);
    } catch (error) {
      setQaError(error.message);
    } finally {
      setQaLoading(false);
    }
  }

  async function handleInterviewPrep() {
    setInterviewLoading(true);
    setInterviewError("");

    try {
      const data = await getInterviewPrep(context);
      setInterviewData(data);
    } catch (error) {
      setInterviewError(error.message);
    } finally {
      setInterviewLoading(false);
    }
  }

  function handleReset() {
    setContext(null);
    setQaHistory([]);
    setInterviewData(null);
    setQaError("");
    setInterviewError("");
    setAnalysisError("");
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <section className="intro">
          <span className="eyebrow">GROUND YOUR PREP IN THE ACTUAL POSTING</span>
          <h1>Understand the job. Prepare smarter.</h1>
          <p>
            Paste a job description once. Ask precise questions, see the
            evidence, and prepare for the interview without generic guesses.
          </p>
        </section>

        <JDInput
          value={jobDescription}
          onChange={setJobDescription}
          onAnalyze={handleAnalyze}
          loading={analysisLoading}
          error={analysisError}
          analyzed={Boolean(context)}
          onReset={handleReset}
        />

        {context && (
          <section className="workspace">
            <div className="workspace-header">
              <div>
                <span className="status-pill">✓ JD analyzed</span>
                <h2>Your grounded workspace</h2>
                <p>
                  Both tools below use the same validated reading of this job
                  description.
                </p>
              </div>

              <div className="tab-switcher" role="tablist" aria-label="JD tools">
                <button
                  className={activeTab === "qa" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("qa")}
                  role="tab"
                  aria-selected={activeTab === "qa"}
                >
                  Ask About This JD
                </button>
                <button
                  className={activeTab === "interview" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("interview")}
                  role="tab"
                  aria-selected={activeTab === "interview"}
                >
                  Interview Prep
                </button>
              </div>
            </div>

            {activeTab === "qa" ? (
              <QASection
                history={qaHistory}
                loading={qaLoading}
                error={qaError}
                onAsk={handleAsk}
              />
            ) : (
              <InterviewPrep
                data={interviewData}
                loading={interviewLoading}
                error={interviewError}
                onGenerate={handleInterviewPrep}
              />
            )}
          </section>
        )}
      </main>

      <footer>
        <span>JD Assistant</span>
        <span>Grounded by the job description you provide.</span>
      </footer>
    </div>
  );
}

export default App;
