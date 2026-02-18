// components/onboarding/OnboardingChecklist.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/i18n";
import BacklogConnectionForm from "@/components/backlog/BacklogConnectionForm";

export type OnboardingState = {
  hasForms: boolean;
  hasBacklogConnection: boolean;
  hasSubmissions: boolean;
};

type Props = {
  state: OnboardingState;
  connectionData: {
    spaceUrl: string;
    defaultProjectKey: string;
    hasApiKey: boolean;
  } | null;
};

const DISMISS_KEY = "fg_onboarding_dismissed";

export default function OnboardingChecklist({ state, connectionData }: Props) {
  const router = useRouter();
  const o = t.onboarding;

  // Hidden during SSR, shown after localStorage check
  const [visible, setVisible] = useState(false);
  const [backlogExpanded, setBacklogExpanded] = useState(false);

  const completedCount =
    (state.hasForms ? 1 : 0) +
    (state.hasBacklogConnection ? 1 : 0) +
    (state.hasSubmissions ? 1 : 0);

  const allDone = completedCount === 3;

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed === "true") {
        setVisible(false);
        return;
      }
    } catch {
      // localStorage unavailable
    }
    setVisible(true);
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  type StepStatus = "done" | "current" | "pending";

  function getStepStatus(done: boolean, index: number): StepStatus {
    if (done) return "done";
    // First incomplete step is "current"
    const steps = [state.hasForms, state.hasBacklogConnection, state.hasSubmissions];
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i]) {
        return i === index ? "current" : "pending";
      }
    }
    return "pending";
  }

  const steps = [
    {
      title: o.step1Title,
      desc: o.step1Desc,
      done: state.hasForms,
      status: getStepStatus(state.hasForms, 0),
    },
    {
      title: o.step2Title,
      desc: o.step2Desc,
      done: state.hasBacklogConnection,
      status: getStepStatus(state.hasBacklogConnection, 1),
    },
    {
      title: o.step3Title,
      desc: o.step3Desc,
      done: state.hasSubmissions,
      status: getStepStatus(state.hasSubmissions, 2),
    },
  ];

  return (
    <div className="onboarding-card animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-neutral-800)" }}
          >
            {allDone ? o.completed : o.title}
          </h2>
          {!allDone && (
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-neutral-500)" }}
            >
              {o.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-accent-600)" }}
          >
            {completedCount}/3 {o.stepsCompleted}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="btn btn-tertiary btn-sm"
            style={{ padding: "4px 8px" }}
          >
            {o.dismiss}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="onboarding-progress mb-6">
        <div
          className="onboarding-progress-bar"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="onboarding-steps">
        {steps.map((step, idx) => (
          <div key={idx}>
            <div className="onboarding-step">
              {/* Indicator */}
              <div className="onboarding-step-indicator">
                <div
                  className={`onboarding-step-circle onboarding-step-circle-${step.status}`}
                >
                  {step.done ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div
                    className={`onboarding-step-line ${
                      step.done ? "onboarding-step-line-done" : ""
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="onboarding-step-content">
                <div
                  className="text-sm font-medium"
                  style={{
                    color: step.done
                      ? "var(--color-neutral-500)"
                      : "var(--color-neutral-800)",
                    textDecoration: step.done ? "line-through" : "none",
                  }}
                >
                  {step.title}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  {step.desc}
                </div>

                {/* Step 1: Create form link */}
                {idx === 0 && !step.done && (
                  <Link
                    href="/forms/new"
                    className="btn btn-primary btn-sm mt-3"
                    style={{ display: "inline-flex" }}
                  >
                    {o.step1Action}
                  </Link>
                )}

                {/* Step 2: Backlog connection */}
                {idx === 1 && !step.done && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setBacklogExpanded(!backlogExpanded)}
                      className="btn btn-primary btn-sm"
                    >
                      {o.step2Action}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: backlogExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Step 3: Hint */}
                {idx === 2 && !step.done && state.hasForms && (
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--color-accent-600)" }}
                  >
                    {o.step3Hint}
                  </p>
                )}
              </div>
            </div>

            {/* Expandable Backlog form */}
            {idx === 1 && (
              <div
                className={`onboarding-expand ${
                  backlogExpanded && !step.done ? "onboarding-expand-open" : ""
                }`}
              >
                <div
                  className="card"
                  style={{
                    margin: "0 0 var(--space-4) 48px",
                  }}
                >
                  <BacklogConnectionForm
                    compact
                    initialData={connectionData}
                    onSaved={() => {
                      setBacklogExpanded(false);
                      router.refresh();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
