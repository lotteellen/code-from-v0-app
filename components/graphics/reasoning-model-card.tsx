"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { BrowserWindow } from "./helpers/browser-window"
import { DummyLine, DummyParagraph } from "./helpers/dummy-helpers"
import { Section, type LineIconType, Search, Document, Answer, Checkbox, Spinner, Plus } from "./helpers/reasoning-components"
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
      updated_question: "When did Tomato pivot to SMB?",
      answer: "March 2023",
      documents_found: 12
    },
    {
      question: "Pricing before pivot?",
      updated_question: "Pricing before March 2023?",
      answer: "$499 / month / seat",
      documents_found: 7
    },
    {
      question: "Are there any additional fees?",
      answer: "$500 setup",
      documents_found: 2,
      dynamic: true,
      appearsAfter: 2
    },
    {
      question: "Pricing after pivot?",
      updated_question: "Pricing after March 2023?",
      answer: "$99 / month / seat",
      documents_found: 3
    }
  ],
  final_answer: "$99/month/seat + $500 setup"
}


const AnswerSection = ({ borderTop, title, showAdditionalLine }: { borderTop: boolean; title?: string; showAdditionalLine: boolean }) => (
  <Section title={title} borderTop={borderTop}>
                <DummyParagraph
                  items={[
                  <DummyLine width="91%" height="var(--line-height-big)" />,
                  <div className="flex flex-row items-center gap-[var(--gap-big)]"> 
                    <DummyLine width="18px" height="var(--line-height-big)" />
                      <span className="styling-text font-bold" style={{ color: "var(--traffic-light-green)" }}>
                        {STEP_DATA.final_answer}
                      </span>
                    <DummyLine width="24px" height="var(--line-height-big)" />
                   </div>,
                  ...(showAdditionalLine ? [<DummyLine width="100%" height="var(--line-height-big)" />] : []),

                  ]}
                  gap="var(--gap-big)"
                />
</Section>
) 

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

// Strip formatting markers to get plain text
function stripFormatting(text: string): string {
  return text.replace(/~[^~]+~/g, '').replace(/\*[^*]+\*/g, (match) => match.slice(1, -1))
}

// Find the common prefix between two strings
function findCommonPrefix(str1: string, str2: string): number {
  let i = 0
  const minLength = Math.min(str1.length, str2.length)
  while (i < minLength && str1[i] === str2[i]) {
    i++
  }
  return i
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
  const [animatedText, setAnimatedText] = useState<string>("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [highlightSuffix, setHighlightSuffix] = useState<string>("")
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  
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

  // Handle text animation when state changes to "updating"
  useEffect(() => {
    // Clear any existing animation timeouts
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    animationTimeoutsRef.current = []

    if (state === "updating" && step.updated_question) {
      setIsAnimating(true)
      const oldText = step.question
      const newTextPlain = stripFormatting(step.updated_question)
      
      // Find where the texts start to differ (common prefix)
      const commonPrefixLength = findCommonPrefix(oldText, newTextPlain)
      const prefix = oldText.slice(0, commonPrefixLength)
      const oldSuffix = oldText.slice(commonPrefixLength)
      const newSuffix = newTextPlain.slice(commonPrefixLength)

      // Start with the old text
      setAnimatedText(oldText)
      setHighlightSuffix(oldSuffix)

      // Phase 1: Highlight the text to be deleted
      setIsHighlighting(true)
      const highlightTimeout = setTimeout(() => {
        setIsHighlighting(false)
        // Phase 2: Instantly remove the highlighted text
        setAnimatedText(prefix)
        setHighlightSuffix("")
        
        // Phase 3: Small pause before typing new text
        const pauseTimeout = setTimeout(() => {
          // Phase 4: Type new text one by one
          const typeChar = (index: number) => {
            if (index <= newSuffix.length) {
              setAnimatedText(prefix + newSuffix.slice(0, index))
              if (index < newSuffix.length) {
                const timeout = setTimeout(() => typeChar(index + 1), 30) // 30ms per character
                animationTimeoutsRef.current.push(timeout)
              } else {
                setIsAnimating(false)
              }
            }
          }
          typeChar(0)
        }, 100) // 100ms pause between delete and type
        animationTimeoutsRef.current.push(pauseTimeout)
      }, 500) // 500ms highlight duration
      animationTimeoutsRef.current.push(highlightTimeout)
    } else {
      setIsAnimating(false)
      setIsHighlighting(false)
      setHighlightSuffix("")
      // Reset animated text when not updating
      if (state === "pending" || state === "active") {
        setAnimatedText(step.question)
      } else if (state !== "updating") {
        setAnimatedText(step.updated_question || step.question)
      }
    }

    return () => {
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      animationTimeoutsRef.current = []
    }
  }, [state, step.question, step.updated_question])

  const displayQuestion = isAnimating 
    ? animatedText
    : state === "pending" || state === "active" 
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
        {isHighlighting ? (
          <>
            {animatedText.slice(0, animatedText.length - highlightSuffix.length)}
            <span style={{ 
              backgroundColor: "rgba(251, 191, 36, 0.3)", 
              borderRadius: "2px",
              padding: "1px 2px",
              outline: "1px solid rgba(251, 191, 36, 0.5)",
              outlineOffset: "1px"
            }}>
              {highlightSuffix}
            </span>
          </>
        ) : isAnimating 
          ? displayQuestion 
          : (displayQuestion.includes('~') || displayQuestion.includes('*') ? parseFormattedText(displayQuestion) : displayQuestion)}
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
        <em className={`styling-text ${state === "retrieving" || state === "answering" ? "text-pulse" : ""}`} style={{ color: "var(--dark-grey)", fontStyle: "italic", whiteSpace: "nowrap", flexShrink: 0 }}>
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
  const [showAdditionalLine, setShowAdditionalLine] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [animatedLines, setAnimatedLines] = useState<boolean[]>([false, false, false])
  const [showPlanSection, setShowPlanSection] = useState(false)
  const [visiblePlanSteps, setVisiblePlanSteps] = useState<Set<number>>(new Set())

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
    setIsThinking(false)
    setAnimatedLines([false, false, false])
    setShowPlanSection(false)
    setVisiblePlanSteps(new Set())
  }

  const handleReset = () => {
    // Clear all timeouts
    thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    thinkingTimeoutsRef.current = []
    planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    planTimeoutsRef.current = []
    
    // Reset to initial state - just thinking section, no animations
    setCurrentStepIndex(null)
    setCurrentPhase("active")
    setStepStates(STEP_DATA.steps.map(() => "pending"))
    setIsPlaying(false)
    setShowPlanning(false)
    setShowSteps(false)
    setShowAnswer(false)
    setShowAdditionalLine(false)
    setIsThinking(false)
    setAnimatedLines([false, false, false])
    setShowPlanSection(false)
    setVisiblePlanSteps(new Set())
  }

  const handleTogglePlay = () => {
    if (isComplete) {
      handleRestart()
      return
    }
    setIsPlaying(!isPlaying)
  }

  const thinkingTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const planTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const handleToggleThinking = () => {
    // Clear any existing timeouts
    thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    thinkingTimeoutsRef.current = []

    if (!isThinking) {
      // Start thinking - animate lines sequentially
      setIsThinking(true)
      setAnimatedLines([false, false, false])
      
      // Animate first line immediately
      const timeout1 = setTimeout(() => setAnimatedLines([true, false, false]), 0)
      thinkingTimeoutsRef.current.push(timeout1)
      
      // Animate second line after a split second
      const timeout2 = setTimeout(() => setAnimatedLines([true, true, false]), 150)
      thinkingTimeoutsRef.current.push(timeout2)
      
      // Animate third line after another split second
      const timeout3 = setTimeout(() => setAnimatedLines([true, true, true]), 300)
      thinkingTimeoutsRef.current.push(timeout3)
    } else {
      // Stop thinking - clear all animations
      setIsThinking(false)
      setAnimatedLines([false, false, false])
    }
  }

  const handleShowPlan = () => {
    // Clear any existing timeouts
    planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    planTimeoutsRef.current = []

    if (!showPlanSection) {
      // Show plan section (just visual display, doesn't start execution)
      setShowPlanSection(true)
      setVisiblePlanSteps(new Set())
      
      // Get all steps that should be shown (respect dynamic step logic)
      const allSteps = STEP_DATA.steps.map((step, index) => ({
        step,
        index,
        shouldShow: step.dynamic 
          ? step.appearsAfter !== undefined &&
            stepStates[step.appearsAfter] === "completed"
          : true
      })).filter(({ shouldShow }) => shouldShow)
      
      // Fade in each step sequentially
      allSteps.forEach(({ index }, i) => {
        const timeout = setTimeout(() => {
          setVisiblePlanSteps(prev => new Set([...prev, index]))
        }, i * 150) // 150ms delay between each step
        planTimeoutsRef.current.push(timeout)
      })
    } else {
      // Hide plan section
      setShowPlanSection(false)
      setVisiblePlanSteps(new Set())
    }
  }

  const handleStartPlan = () => {
    // Start the actual plan execution flow
    if (!showPlanning) {
      setShowPlanning(true)
    }
    if (!showSteps) {
      setShowSteps(true)
      // Start first step when steps section is shown
      if (currentStepIndex === null) {
        setCurrentStepIndex(0)
        setCurrentPhase("active")
        setStepStates(updateStepState(stepStates, 0, "active"))
      }
    }
  }

  const handleReplaceText = () => {
    // Replace old question with new (updated_question) for all active/pending steps that have updated_question
    const newStates = stepStates.map((state, index) => {
      const step = STEP_DATA.steps[index]
      // Check if step should be shown (not dynamic or dynamic step that should appear)
      const shouldShow = step.dynamic 
        ? step.appearsAfter !== undefined &&
          stepStates[step.appearsAfter] === "completed"
        : true
      
      if (shouldShow && (state === "active" || state === "pending") && step.updated_question) {
        return "updating"
      }
      return state
    })
    setStepStates(newStates)
  }

  const handleRetrieval = () => {
    // Do retrieval to docs found for all updating/active/pending steps
    let newStates = stepStates.map((state, index) => {
      const step = STEP_DATA.steps[index]
      // Check if step should be shown
      const shouldShow = step.dynamic 
        ? step.appearsAfter !== undefined &&
          stepStates[step.appearsAfter] === "completed"
        : true
      
      if (shouldShow && (state === "updating" || state === "active" || state === "pending")) {
        return "retrieving"
      }
      return state
    })
    setStepStates(newStates)
    
    // After a brief delay, move to documents_found
    setTimeout(() => {
      setStepStates(prevStates => 
        prevStates.map((state, index) => {
          if (state === "retrieving") {
            return "documents_found"
          }
          return state
        })
      )
    }, 500)
  }

  const handleAnswer = () => {
    // Extract to answer found for all documents_found steps
    let newStates = stepStates.map((state, index) => {
      if (state === "documents_found") {
        return "answering"
      }
      return state
    })
    setStepStates(newStates)
    
    // After a brief delay, move to completed
    setTimeout(() => {
      setStepStates(prevStates => 
        prevStates.map((state, index) => {
          if (state === "answering") {
            return "completed"
          }
          return state
        })
      )
    }, 500)
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      thinkingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      planTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

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
                  <DummyLine width="100%" height="var(--line-height-big)" className={animatedLines[0] ? "text-pulse" : ""} />, 
                  <DummyLine width="87%" height="var(--line-height-big)" className={animatedLines[1] ? "text-pulse" : ""} />,
                  <DummyLine width="95%" height="var(--line-height-big)" className={animatedLines[2] ? "text-pulse" : ""} />,
                ]}
                gap="var(--gap-big)"
              />
            </Section>
            {(showPlanning || showPlanSection) && (
              <Section title="Plan">
                {STEP_DATA.steps
                  .map((step, index) => ({
                    step,
                    index,
                    shouldShow: step.dynamic 
                      ? step.appearsAfter !== undefined &&
                        stepStates[step.appearsAfter] === "completed"
                      : true
                  }))
                  .filter(({ shouldShow }) => shouldShow)
                  .map(({ step, index }) => {
                    const isVisible = showPlanSection ? visiblePlanSteps.has(index) : (showSteps && true)
                    return (
                      <div
                        key={`step-${index}-${step.question}`}
                        className={isVisible ? "plan-step-fade-in" : ""}
                        style={{
                          opacity: showPlanSection ? (isVisible ? 1 : 0) : 1,
                          transition: showPlanSection ? "opacity 0.3s ease-in" : "none"
                        }}
                      >
                        <Step
                          step={step}
                          state={stepStates[index]}
                          shouldShow={true}
                        />
                      </div>
                    )
                  })}
              </Section>
            )}
            {showAnswer && allStepsCompleted && <AnswerSection borderTop={true} title="Answer" showAdditionalLine={showAdditionalLine} />}
          </>
        }
      />
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-row gap-2">
          <Button onClick={handleToggleThinking} size="sm">
            {isThinking ? "Stop Thinking" : "Start Thinking"}
          </Button>
          <Button onClick={handleShowPlan} size="sm">
            {showPlanSection ? "Hide Plan" : "Show Plan"}
          </Button>
          <Button onClick={handleStartPlan} size="sm" disabled={showSteps && currentStepIndex !== null}>
            Start Plan
          </Button>
          <Button onClick={handleReset} size="sm">
            Reset
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={handleReplaceText} size="sm" disabled={!showPlanning && !showPlanSection}>
            Replace Text
          </Button>
          <Button onClick={handleRetrieval} size="sm" disabled={!showPlanning && !showPlanSection}>
            Retrieval
          </Button>
          <Button onClick={handleAnswer} size="sm" disabled={!showPlanning && !showPlanSection}>
            Answer
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={() => setShowAdditionalLine(!showAdditionalLine)} size="sm" disabled={!showAnswer || !allStepsCompleted}>
            {showAdditionalLine ? "Hide Additional Line" : "Show Additional Line"}
          </Button>
        </div>
        <button
          onClick={handleTogglePlay}
          style={{
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
    </div>
  )
}

