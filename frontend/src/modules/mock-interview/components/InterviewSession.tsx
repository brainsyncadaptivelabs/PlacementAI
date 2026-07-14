"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
import { useInterviewStore } from "../hooks/useInterviewStore";
import { interviewService } from "../services/interviewService";
import { InterviewQuestion } from "../types/interview.types";
import {
  InterviewStateProvider,
  InterviewAudioProvider,
  useInterviewStateContext,
  useInterviewAudioContext,
  CallStatus,
  SavedMessage,
  InterviewData,
} from "./session/InterviewContexts";
import { InterviewLayout } from "./session/InterviewLayout";
import { InterviewControls } from "./session/InterviewControls";

interface InterviewSessionProps {
  userName: string;
  interviewData: InterviewData;
}

const SessionController = () => {
  const router = useRouter();
  const {
    interviewData,
    callStatus,
    setCallStatus,
    messages,
    setMessages,
    lastMessage,
    setLastMessage,
    isGenerating,
    setIsGenerating,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    typedAnswer,
    setTypedAnswer,
    answers,
    setAnswers,
    code,
    activeLang,
    terminalOutput,
  } = useInterviewStateContext();

  const { vadState, setVadState, setMicVolume } = useInterviewAudioContext();
  const [isMicLoading, setIsMicLoading] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // ElevenLabs voice conversation connection integration
  const conversation = useConversation({
    onConnect: () => {
      setCallStatus(CallStatus.ACTIVE);
      setVadState("LISTENING");
    },
    onDisconnect: () => {
      setCallStatus(CallStatus.FINISHED);
      setVadState("INACTIVE");
    },
    onMessage: (message) => {
      const role = message.source === "user" ? "user" : "assistant";
      setMessages((prev) => [...prev, { role, content: message.message }]);
      if (role === "assistant") {
        setLastMessage(message.message);
      }
    },
    onError: (error) => {
      console.error("ElevenLabs Error:", error);
      startFallbackMode();
    },
  });

  const startFallbackMode = () => {
    setCallStatus(CallStatus.ACTIVE);
    setVadState("LISTENING");
    if (interviewData.questions && interviewData.questions.length > 0) {
      const firstQ = interviewData.questions[0];
      setMessages([{ role: "assistant", content: firstQ }]);
      setLastMessage(firstQ);
    }
  };

  const handleToggleMic = async () => {
    if (callStatus === CallStatus.ACTIVE) {
      await conversation.endSession();
      setCallStatus(CallStatus.FINISHED);
    } else {
      setIsMicLoading(true);
      try {
        await conversation.startSession({
          agentId: "dummy-agent-id",
        });
      } catch (e) {
        console.warn("ElevenLabs session startup failed, using fallback.", e);
        startFallbackMode();
      } finally {
        setIsMicLoading(false);
      }
    }
  };

  const handleSubmitTextAnswer = async (answer: string) => {
    if (!answer.trim()) return;

    // Save candidate response
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));

    if (interviewData.isAdaptive && interviewData.adaptiveInterviewId) {
      setIsGenerating(true);
      try {
        const response = await interviewService.answerAdaptiveInterview(
          interviewData.adaptiveInterviewId,
          answer,
          code,
          activeLang,
          terminalOutput,
          10,
          30
        );

        if (response.isFinished) {
          setCallStatus(CallStatus.FINISHED);
          handleGenerateFeedback();
        } else if (response.nextQuestion) {
          const nextIdx = currentQuestionIndex + 1;
          useInterviewStore.getState().setInterviewData({
            ...interviewData,
            questions: [...interviewData.questions, response.nextQuestion ?? ""],
          });
          setCurrentQuestionIndex(nextIdx);
          setMessages((prev) => [...prev, { role: "assistant", content: response.nextQuestion ?? "" }]);
          setLastMessage(response.nextQuestion ?? "");
        }
      } catch (err) {
        console.error("Failed to submit adaptive answer", err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    try {
      const questionsList: InterviewQuestion[] = interviewData.questions.map((q, i) => ({
        questionText: q,
        answerText: answers[i] || "[No answer submitted]",
        score: 0,
      }));

      const feedback = await interviewService.saveResults({
        id: interviewData.adaptiveInterviewId!,
        role: interviewData.role,
        experienceLevel: interviewData.experienceLevel,
        questions: questionsList,
      });

      router.push(`/mock-interview/result/${feedback.id}`);
    } catch (e) {
      console.error("Failed to generate feedback report card", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEndSession = async () => {
    if (callStatus === CallStatus.ACTIVE) {
      await conversation.endSession();
    }
    setCallStatus(CallStatus.FINISHED);
    handleGenerateFeedback();
  };

  return (
    <InterviewLayout
      controls={
        <InterviewControls
          onToggleMic={handleToggleMic}
          onSubmitTextAnswer={handleSubmitTextAnswer}
          onEndSession={handleEndSession}
          isMicLoading={isMicLoading}
        />
      }
    />
  );
};

export const InterviewSession = ({ userName, interviewData }: InterviewSessionProps) => {
  return (
    <InterviewStateProvider userName={userName} interviewData={interviewData}>
      <InterviewAudioProvider>
        <SessionController />
      </InterviewAudioProvider>
    </InterviewStateProvider>
  );
};
