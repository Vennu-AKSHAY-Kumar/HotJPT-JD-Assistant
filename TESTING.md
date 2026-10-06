# Manual Testing Checklist

## TEST 1 — Valid JD

Action:
- Paste a normal job description.
- Click **Analyze Job Description**.

Expected:
- JD analyzes successfully.
- `JD analyzed` status appears.
- Q&A and Interview Prep become available.

## TEST 2 — Grounded technology question

Ask:

```text
What technologies are required?
```

Expected:
- Answer uses only JD information.
- Evidence from the JD is shown.

## TEST 3 — Information absent from JD

Ask:

```text
Does the company provide free lunch?
```

Expected:

```text
Not stated in this posting.
```

No evidence should be displayed.

## TEST 4 — Generate interview preparation

Expected sections:
- Technical
- Behavioral
- Role-Specific

## TEST 5 — Check question reasons

Expected:
- Every displayed interview question has a reason tied to JD content.

## TEST 6 — Missing Gemini API key

Action:
- Remove `GEMINI_API_KEY`.
- Restart backend.
- Try Analyze.

Expected:
- Friendly configuration error.
- No stack trace or secret data appears.

## TEST 7 — Empty JD

Expected:

```text
Please paste a job description before continuing.
```

## TEST 8 — Empty question

Expected:

```text
Please enter a question.
```

## TEST 9 — Duplicate button clicks

Expected:
- Button disables while its request is active.
- No duplicate request is sent from normal repeated clicks.

## TEST 10 — Responsive layout

Check:
- desktop,
- tablet,
- mobile widths.

Expected:
- no horizontal overflow,
- readable cards,
- usable buttons and inputs.

## Additional Grounding Checks

Ask questions that require unsupported inference, for example:

```text
Is this company financially stable?
Will I get promoted quickly?
Is the manager good?
```

Expected:

```text
Not stated in this posting.
```
