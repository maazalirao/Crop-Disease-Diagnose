"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DiagnosisResult from "@/components/DiagnosisResult";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDiagnosisById, submitDiagnosisFeedback } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import type { DiagnosisResult as DiagnosisResultType } from "@/lib/api";

export default function DiagnosisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [diagnosis, setDiagnosis] = useState<DiagnosisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        setIsLoading(true);
        const result = await getDiagnosisById(id);

        if (result) {
          setDiagnosis(result);
        } else {
          setError("Diagnosis record not found");
        }
      } catch (err) {
        console.error("Error fetching diagnosis:", err);
        setError("Failed to load diagnosis details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosis();
  }, [id]);

  const handleFeedback = async (isHelpful: boolean) => {
    if (!diagnosis) return;

    try {
      await submitDiagnosisFeedback(diagnosis.id, isHelpful);
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
        <div className="mb-6">
          <Link href="/history">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-64 bg-muted rounded"></div>
            <div className="h-64 w-full bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !diagnosis) {
    return (
      <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
        <div className="mb-6">
          <Link href="/history">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Error</h3>
                <p className="text-muted-foreground">
                  {error || "Failed to load diagnosis details"}
                </p>
                <Link href="/history">
                  <Button className="mt-4">Return to History</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
      <div className="mb-6">
        <Link href="/history">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <DiagnosisResult
          isHealthy={diagnosis.isHealthy}
          diseaseName={diagnosis.diseaseName}
          confidenceScore={diagnosis.confidenceScore}
          description={diagnosis.description}
          symptoms={diagnosis.symptoms}
          treatmentOptions={diagnosis.treatmentOptions}
          productRecommendations={diagnosis.productRecommendations}
          plantType={diagnosis.plantType}
          imageUrl={diagnosis.imageUrl}
          onFeedbackSubmit={handleFeedback}
          feedbackSubmitted={feedbackSubmitted}
        />
      </div>
    </div>
    </div>
  );
}
