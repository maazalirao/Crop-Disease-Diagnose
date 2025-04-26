"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ImageUploadSection from "@/components/ImageUploadSection";
import DiagnosisResult from "@/components/DiagnosisResult";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  analyzePlantImage,
  submitDiagnosisFeedback,
  type DiagnosisResult as DiagnosisResultType,
} from "@/lib/api";

export default function DiagnosisPage() {
  return (
    <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/history">
          <Button variant="outline">View History</Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <DiagnosisPageClient />
      </div>
    </div>
    </div>
  );
}

function DiagnosisPageClient() {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleImageSubmit = async (image: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setFeedbackSubmitted(false);

      // Analyze the image
      const result = await analyzePlantImage(image);
      setDiagnosisResult(result);
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setDiagnosisResult(null);
    setError(null);
    setFeedbackSubmitted(false);
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!diagnosisResult) return;

    try {
      await submitDiagnosisFeedback(diagnosisResult.id, isHelpful);
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {!diagnosisResult ? (
        <ImageUploadSection
          onImageSubmit={handleImageSubmit}
          isProcessing={isProcessing}
        />
      ) : (
        <div className="space-y-6">
          <DiagnosisResult
            isLoading={isProcessing}
            diseaseName={diagnosisResult.diseaseName}
            isHealthy={diagnosisResult.isHealthy}
            confidenceScore={diagnosisResult.confidenceScore}
            description={diagnosisResult.description}
            symptoms={diagnosisResult.symptoms}
            treatmentOptions={diagnosisResult.treatmentOptions}
            productRecommendations={diagnosisResult.productRecommendations}
            plantType={diagnosisResult.plantType}
            imageUrl={diagnosisResult.imageUrl}
            onFeedbackSubmit={handleFeedback}
            feedbackSubmitted={feedbackSubmitted}
          />

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset} className="mt-4">
              Analyze Another Plant
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
