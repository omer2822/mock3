import { useEffect, useMemo, useRef, useState } from "react";

type PollCreateFormProps = {
  isSubmitting: boolean;
  onCancel: () => void;
  onCreate: (input: { question: string; options: string[] }) => Promise<void>;
};

type FormErrors = {
  question?: string;
  options: string[];
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

function createEmptyOptions(count: number) {
  return Array.from({ length: count }, () => "");
}

export function PollCreateForm({
  isSubmitting,
  onCancel,
  onCreate
}: PollCreateFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(createEmptyOptions(MIN_OPTIONS));
  const [errors, setErrors] = useState<FormErrors>({ options: createEmptyOptions(MIN_OPTIONS) });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const questionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    questionRef.current?.focus();
  }, []);

  const canAddOption = options.length < MAX_OPTIONS;
  const canRemoveOption = options.length > MIN_OPTIONS;

  const optionLabels = useMemo(
    () => options.map((_, index) => `Option ${index + 1}`),
    [options],
  );

  const validate = () => {
    const nextErrors: FormErrors = {
      options: options.map((option) =>
        option.trim() ? "" : "Option text is required"
      )
    };

    if (!question.trim()) {
      nextErrors.question = "Question is required";
    }

    setErrors(nextErrors);

    return !nextErrors.question && nextErrors.options.every((error) => !error);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(null);

    if (!validate()) {
      return;
    }

    try {
      await onCreate({
        question: question.trim(),
        options: options.map((option) => option.trim())
      });
      setQuestion("");
      setOptions(createEmptyOptions(MIN_OPTIONS));
      setErrors({ options: createEmptyOptions(MIN_OPTIONS) });
      questionRef.current?.focus();
    } catch {
      setSubmissionError("The poll could not be published. Try again.");
    }
  };

  const updateOption = (index: number, value: string) => {
    setOptions((current) => current.map((option, optionIndex) => (
      optionIndex === index ? value : option
    )));
    setErrors((current) => ({
      question: current.question,
      options: current.options.map((error, optionIndex) => (
        optionIndex === index ? "" : error
      ))
    }));
  };

  const addOption = () => {
    if (!canAddOption) {
      return;
    }

    setOptions((current) => [...current, ""]);
    setErrors((current) => ({
      question: current.question,
      options: [...current.options, ""]
    }));
  };

  const removeOption = (index: number) => {
    if (!canRemoveOption) {
      return;
    }

    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setErrors((current) => ({
      question: current.question,
      options: current.options.filter((_, optionIndex) => optionIndex !== index)
    }));
  };

  return (
    <section className="panel create-panel">
      <div className="detail-topbar">
        <button type="button" className="back-button" onClick={onCancel}>
          Back to all polls
        </button>
        <span className="panel-chip">New poll</span>
      </div>
      <div className="panel__header">
        <p className="eyebrow">Create Poll</p>
        <h1>Compose a question worth answering</h1>
        <p className="detail">
          Write one clear prompt, add up to five options, and publish it straight
          into the live poll list.
        </p>
      </div>
      <form className="create-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Poll question</span>
          <input
            ref={questionRef}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setErrors((current) => ({ ...current, question: undefined }));
            }}
            className={`field__input${errors.question ? " field__input--error" : ""}`}
            aria-invalid={Boolean(errors.question)}
          />
          {errors.question ? <span className="field__error">{errors.question}</span> : null}
        </label>

        <div className="field-group">
          <div className="field-group__header">
            <span className="field__label">Options</span>
            <button
              type="button"
              className="ghost-button"
              onClick={addOption}
              disabled={!canAddOption}
            >
              Add option
            </button>
          </div>
          <div className="option-editor-list">
            {options.map((option, index) => (
              <div className="option-editor" data-testid="option-row" key={`option-${index}`}>
                <label className="field">
                  <span className="field__label">{optionLabels[index]}</span>
                  <input
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                    className={`field__input${
                      errors.options[index] ? " field__input--error" : ""
                    }`}
                    aria-label={optionLabels[index]}
                    aria-invalid={Boolean(errors.options[index])}
                  />
                  {errors.options[index] ? (
                    <span className="field__error">{errors.options[index]}</span>
                  ) : null}
                </label>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeOption(index)}
                  disabled={!canRemoveOption}
                >
                  Remove option {index + 1}
                </button>
              </div>
            ))}
          </div>
        </div>

        {submissionError ? <p className="banner banner--error">{submissionError}</p> : null}

        <div className="create-form__actions">
          <button type="button" className="back-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="vote-button" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish poll"}
          </button>
        </div>
      </form>
    </section>
  );
}
