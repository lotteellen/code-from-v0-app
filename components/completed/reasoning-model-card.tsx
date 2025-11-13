"use client"

import React, { useState, useEffect, useRef } from "react"
import { BrowserWindow } from "../graphics/helpers/browser-window"
import { DummyLine, DummyParagraph } from "../graphics/helpers/dummy-helpers"
import { Section, type LineIconType } from "../graphics/helpers/reasoning-components"
import { Search, Document, Answer, Checkbox, Spinner, Plus } from "../graphics/helpers/reasoning-icons"
import "../graphics/helpers/globals.css"

const STEP_DATA = {
  steps: [
    {
      question: "Where does user work?",
      answer: "Tomato, Inc.",
      documents_found: 12
    },
    {
      question: "When did they pivot?",
      updated_question: "When did ~they~ *Tomato* pivot *to SMB*?",
      answer: "March 2023",
      documents_found: 12
    },
    {
      question: "Pricing before pivot?",
      updated_question: "Pricing before ~pivot~ *March 2023*?",
      answer: "$499 / month / seat",
      documents_found: 7
    },
    {
      question: "*Are there any additional fees*?",
      answer: "$500 setup",
      documents_found: 2,
      dynamic: true,
      appearsAfter: 2
    },
    {
      question: "Pricing after pivot?",
      updated_question: "Pricing after ~pivot~ *March 2023*?",
      answer: "$99 / month / seat",
      documents_found: 3
    }
  ],
  final_answer: "$99/month/seat + $500 setup"
}

type StepState = "pending" | "active" | "updating" | "retrieving" | "documents_found" | "answering" | "completed"
type Phase = "active" | "updating" | "retrieving" | "documents_found" | "answering" | "completed"

const PHASES: Phase[] = ["active", "updating", "retrieving", "documents_found", "answering", "completed"]

type StepData = {
  question: string
  updated_question?: string
  answer: string
  documents_found: number
  dynamic?: boolean
  appearsAfter?: number
}

// Parse text with ~text~ (strikethrough) and *text* (replacement/new text) formatting
function parseFormattedText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let currentIndex = 0
  
  // Match ~text~ (strikethrough) or *text* (replacement)
  const pattern = /(~[^~]+~|\*[^*]+\*)/g
  let match
  
  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index))
    }
    
    const matchedText = match[0]
    if (matchedText.startsWith('~') && matchedText.endsWith('~')) {
      // Strikethrough text
      const content = matchedText.slice(1, -1)
      parts.push(
        <span key={match.index} style={{ textDecoration: "line-through", opacity: 0.6 }}>
          {content}
        </span>
      )
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      // Replacement/new text
      const content = matchedText.slice(1, -1)
      parts.push(
        <span key={match.index} style={{ fontWeight: "600" }}>
          {content}
        </span>
      )
    }
    
    currentIndex = match.index + matchedText.length
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex))
  }
  
  return parts.length > 0 ? parts : [text]
}

function Step({ step, state, shouldShow }: { step: StepData; state: StepState; shouldShow: boolean }) {
  if (!shouldShow) return null

  const [showPlus, setShowPlus] = useState(false)
  const hasStartedTransition = useRef(false)
  
  useEffect(() => {
    if (step.dynamic && state === "pending" && shouldShow && !hasStartedTransition.current) {
      // Start with Checkbox (white bg, grey cross), then transition to Plus after a delay
      hasStartedTransition.current = true
      setShowPlus(false) // Start with Checkbox
      // Then transition to Plus (grey bg, white cross) after a brief delay
      const timer = setTimeout(() => {
        setShowPlus(true)
      }, 200) // 200ms delay before showing Plus
      return () => clearTimeout(timer)
    } else if (state !== "pending") {
      // Reset when step becomes active (will show Spinner)
      setShowPlus(false)
      hasStartedTransition.current = false
    }
  }, [step.dynamic, state, shouldShow])

  const displayQuestion = state === "pending" || state === "active" 
    ? step.question 
    : (step.updated_question || step.question)
  const questionIcon: LineIconType = state === "pending" ? "open" : state === "completed" ? "done" : "spinner"
  const showDetails = state !== "pending" && state !== "active" && state !== "updating"

  const statusMessages = {
    active: "",
    updating: "",
    retrieving: "Retrieving",
    documents_found: `${step.documents_found} Results`,
    answering: "Reasoning",
    completed: step.answer,
  }

  const statusIconComponent = state === "completed" ? <Answer /> : state === "documents_found" || state === "answering" ? <Document /> : <Search />

  const leftPart = (
    <div id="left-part" style={{ display: "flex", alignItems: "center", gap: "4px", flex: "1 1 0", minWidth: 0, overflow: "hidden" }}>
      {questionIcon && (
        <div style={{ flexShrink: 0 }}>
          {questionIcon === "open" ? (
            step.dynamic && showPlus ? <Plus /> : <Checkbox checked={false} />
          ) : 
           questionIcon === "done" ? <Checkbox checked={true} /> : 
           questionIcon === "spinner" ? <Spinner /> : null}
        </div>
      )}
      <span className="styling-text" style={{ color: "var(--dark-grey)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
        {displayQuestion.includes('~') || displayQuestion.includes('*') ? parseFormattedText(displayQuestion) : displayQuestion}
      </span>
    </div>
  )

  const rightPart = showDetails ? (
    <div id="right-part" style={{ display: "flex", alignItems: "center", gap: "2px", whiteSpace: "nowrap", flexShrink: 0 }}>
      <div style={{ flexShrink: 0 }}>
        {statusIconComponent}
      </div>
      {state === "completed" || state === "documents_found" ? (
        <span className="styling-text" style={{ color: state === "completed" ? "var(--dark-grey)" : "var(--dark-grey)", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0 }}>
          {statusMessages[state]}
        </span>
      ) : (
        <em className="styling-text" style={{ color: "var(--dark-grey)", fontStyle: "italic", whiteSpace: "nowrap", flexShrink: 0 }}>
          {statusMessages[state]}
        </em>
      )}
    </div>
  ) : null

  return (
    <div style={{ marginBottom: "8px", transition: "all 0.1s ease", whiteSpace: "nowrap", width: "100%", paddingLeft: "4px", paddingRight: "4px", overflow: "hidden", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "4px", minWidth: 0, minHeight: "6px", height: "6px" }}>
        {leftPart}
        {rightPart}
      </div>
    </div>
  )
}

function updateStepState(states: StepState[], index: number, newState: StepState): StepState[] {
  const newStates = [...states]
  newStates[index] = newState
  return newStates
}

function findNextStepIndex(
  currentIndex: number,
  steps: StepData[],
  stepStates: StepState[]
): number | null {
  // Check for dynamic step that should appear after current step
  const dynamicStepIndex = steps.findIndex(
    (step, idx) =>
      step.dynamic &&
      step.appearsAfter === currentIndex &&
      stepStates[idx] === "pending"
  )

  if (dynamicStepIndex !== -1) return dynamicStepIndex

  // Find next available step
  for (let i = currentIndex + 1; i < steps.length; i++) {
    const step = steps[i]
    if (step.dynamic) {
      if (
        step.appearsAfter !== undefined &&
        stepStates[step.appearsAfter] === "completed" &&
        stepStates[i] === "pending"
      ) {
        return i
      }
    } else if (stepStates[i] === "pending") {
      return i
    }
  }
  return null
}

export function ReasoningModelCard() {
  const [stepStates, setStepStates] = useState<StepState[]>(
    STEP_DATA.steps.map(() => "pending")
  )
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null)
  const [currentPhase, setCurrentPhase] = useState<Phase>("active")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlanning, setShowPlanning] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const allStepsCompleted = stepStates.every((state) => state === "completed")

  const handleNext = () => {
    // Show sections in sequence: Planning -> Steps -> Answer
    if (!showPlanning) {
      setShowPlanning(true)
      return
    }
    
    if (!showSteps) {
      setShowSteps(true)
      // Start first step when steps section is shown
      if (currentStepIndex === null) {
        setCurrentStepIndex(0)
        setCurrentPhase("active")
        setStepStates(updateStepState(stepStates, 0, "active"))
      }
      return
    }

    if (currentStepIndex === null) {
      // Start first step
      setCurrentStepIndex(0)
      setCurrentPhase("active")
      setStepStates(updateStepState(stepStates, 0, "active"))
      return
    }

    const currentPhaseIndex = PHASES.indexOf(currentPhase)
    if (currentPhaseIndex < PHASES.length - 1) {
      // Advance to next phase
      const nextPhase = PHASES[currentPhaseIndex + 1]
      setCurrentPhase(nextPhase)
      setStepStates(updateStepState(stepStates, currentStepIndex, nextPhase))
    } else {
      // Move to next step
      const nextIndex = findNextStepIndex(currentStepIndex, STEP_DATA.steps, stepStates)
      if (nextIndex !== null) {
            setCurrentStepIndex(nextIndex)
            setCurrentPhase("active")
        setStepStates(updateStepState(stepStates, nextIndex, "active"))
      } else {
        // All steps completed, show answer
        if (allStepsCompleted && !showAnswer) {
          setShowAnswer(true)
        }
      }
    }
  }

  const isComplete =
    currentStepIndex !== null &&
    currentStepIndex === STEP_DATA.steps.length - 1 &&
    currentPhase === "completed"

  const handleRestart = () => {
    setCurrentStepIndex(null)
    setCurrentPhase("active")
    setStepStates(STEP_DATA.steps.map(() => "pending"))
    setIsPlaying(false)
    setShowPlanning(false)
    setShowSteps(false)
    setShowAnswer(false)
  }

  const handleTogglePlay = () => {
    if (isComplete) {
      handleRestart()
      return
    }
    setIsPlaying(!isPlaying)
  }

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return

    // Check if all steps are completed
    const checkComplete = () => {
      const completed = stepStates.every((state) => state === "completed")
      if (completed && showAnswer) {
        setIsPlaying(false)
        return true
      }
      return false
    }

    if (checkComplete()) return

    const timer = setTimeout(() => {
      handleNext()
    }, 500) // 500ms between steps

    return () => clearTimeout(timer)
  }, [isPlaying, currentStepIndex, currentPhase, stepStates, allStepsCompleted, showPlanning, showSteps, showAnswer])

  return (
    <div style={{ position: "relative", width: "100%", margin: "0 auto" }}>
      <BrowserWindow
        title="SID Reasoning Retriever"
        menu={false}
        fitContent={true}
        content={
          <>
            <Section title="Thinking" borderTop={false}>
                <DummyParagraph
                  items={[
                    <DummyLine width="100%" height="var(--line-height-big)" />, 
                    <DummyLine width="87%" height="var(--line-height-big)" />,
                    <DummyLine width="95%" height="var(--line-height-big)" />,
                  ]}
                  gap="var(--gap-big)"
                />
            </Section>
            {showPlanning && (
              <Section title="Plan">
                {showSteps && STEP_DATA.steps
                  .map((step, index) => ({
                    step,
                    index,
                    shouldShow: step.dynamic 
                      ? step.appearsAfter !== undefined &&
                        stepStates[step.appearsAfter] === "completed"
                      : true
                  }))
                  .filter(({ shouldShow }) => shouldShow)
                  .map(({ step, index }) => (
                    <Step
                      key={`step-${index}-${step.question}`}
                      step={step}
                      state={stepStates[index]}
                      shouldShow={true}
                    />
                  ))}
              </Section>
            )}
            {showAnswer && allStepsCompleted && (
              <Section title="Answer">
                <DummyParagraph
                  items={[
                  <DummyLine width="100%" height="var(--line-height-big)" />,
                  <div className="flex flex-row items-center gap-[var(--gap-big)]"> 
                    <DummyLine width="30px" height="var(--line-height-big)" />
                      <span className="styling-text font-bold" style={{ color: "var(--traffic-light-green)" }}>
                        {STEP_DATA.final_answer}
                      </span>
                    <DummyLine width="40px" height="var(--line-height-big)" />
                    </div>,
                  ]}
                  gap="var(--gap-big)"
                />
              </Section>
            )}
          </>
        }
      />
      <button
        onClick={handleTogglePlay}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "10px 16px",
          borderRadius: "var(--border-radius)",
          border: "1.5px solid #E5E7EB",
          background: "white",
          color: "#4B5563",
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F9FAFB"
          e.currentTarget.style.borderColor = "#D1D5DB"
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)"
          e.currentTarget.style.transform = "translateY(-1px)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white"
          e.currentTarget.style.borderColor = "#E5E7EB"
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.03)"
          e.currentTarget.style.transform = "translateY(0)"
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(0)"
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)"
        }}
      >
        {isComplete ? "Restart" : currentStepIndex === null ? "Start" : isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  )
}

