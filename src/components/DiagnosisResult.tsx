"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  Leaf,
  Download,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface TreatmentOption {
  name: string;
  description: string;
  effectiveness: number;
  applicationMethod: string;
}

interface ProductRecommendation {
  name: string;
  type: string;
  description: string;
  imageUrl?: string;
}

interface DiagnosisResultProps {
  isLoading?: boolean;
  diseaseName?: string;
  isHealthy?: boolean;
  confidenceScore?: number;
  description?: string;
  symptoms?: string[];
  treatmentOptions?: TreatmentOption[];
  productRecommendations?: ProductRecommendation[];
  plantType?: string;
  imageUrl?: string;
  onFeedbackSubmit?: (isHelpful: boolean) => void;
  feedbackSubmitted?: boolean;
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  isLoading = false,
  diseaseName = "Leaf Blight",
  isHealthy = false,
  confidenceScore = 87,
  description = "Leaf blight is a common fungal disease affecting various crops. It causes brown spots that expand into larger lesions, eventually leading to leaf death if untreated.",
  symptoms = [
    "Brown spots on leaves",
    "Yellowing around lesions",
    "Premature leaf drop",
    "Stunted growth",
  ],
  treatmentOptions = [
    {
      name: "Fungicide Application",
      description:
        "Apply copper-based fungicide to affected areas and surrounding plants.",
      effectiveness: 85,
      applicationMethod:
        "Spray evenly on leaf surfaces, focusing on both top and bottom sides.",
    },
    {
      name: "Cultural Control",
      description:
        "Remove and destroy infected plant parts. Improve air circulation around plants.",
      effectiveness: 70,
      applicationMethod: "Prune affected areas and space plants appropriately.",
    },
    {
      name: "Biological Control",
      description:
        "Introduce beneficial microorganisms that suppress the pathogen.",
      effectiveness: 60,
      applicationMethod:
        "Apply as a soil drench or foliar spray according to product instructions.",
    },
  ],
  productRecommendations = [
    {
      name: "BioFungal Control",
      type: "Organic Fungicide",
      description: "Natural copper-based fungicide safe for organic farming.",
      imageUrl:
        "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
    },
    {
      name: "LeafGuard Pro",
      type: "Synthetic Fungicide",
      description:
        "Broad-spectrum fungicide with preventative and curative action.",
      imageUrl:
        "https://images.unsplash.com/photo-1620662736427-b8a198f52a4d?w=400&q=80",
    },
    {
      name: "MicroDefender",
      type: "Biological Control Agent",
      description: "Contains beneficial bacteria that compete with pathogens.",
      imageUrl:
        "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&q=80",
    },
  ],
  plantType = "Tomato",
  imageUrl = "https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=800&q=80",
  onFeedbackSubmit,
  feedbackSubmitted = false,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-background">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="animate-pulse rounded-full bg-primary/20 h-16 w-16 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="text-xl font-medium">Analyzing your plant...</h3>
            <Progress value={65} className="w-64" />
            <p className="text-muted-foreground">
              Our AI is examining the image for signs of disease
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: isHealthy
            ? "Healthy Plant Diagnosis"
            : `Plant Disease: ${diseaseName}`,
          text: `Check out my plant diagnosis: ${isHealthy ? "Healthy Plant" : diseaseName} (${confidenceScore}% confidence)`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF report
    // For now, we'll just create a text summary
    const reportContent = `
      Plant Disease Diagnosis Report
      ============================
      Date: ${new Date().toLocaleDateString()}
      
      Diagnosis: ${isHealthy ? "Healthy Plant" : diseaseName}
      Plant Type: ${plantType}
      Confidence: ${confidenceScore}%
      
      ${description}
      
      ${!isHealthy ? `Symptoms:\n${symptoms?.join("\n")}` : ""}
      
      ${!isHealthy ? `Recommended Treatments:\n${treatmentOptions?.map((t) => `- ${t.name}: ${t.description}`).join("\n")}` : ""}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-diagnosis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              {isHealthy
                ? "Healthy Plant Detected"
                : `Diagnosis: ${diseaseName}`}
            </CardTitle>
            <CardDescription className="mt-2">
              Plant Type: {plantType} | Confidence: {confidenceScore}%
            </CardDescription>
          </div>
          <Badge
            variant={isHealthy ? "default" : "destructive"}
            className="text-sm py-1 px-3 self-start md:self-auto"
          >
            {isHealthy ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Healthy
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Disease Detected
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="rounded-lg overflow-hidden border">
              <img
                src={imageUrl}
                alt={isHealthy ? "Healthy plant" : `Plant with ${diseaseName}`}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {isHealthy ? "Plant Status" : "Disease Information"}
            </h3>
            <p className="text-muted-foreground">{description}</p>

            {!isHealthy && symptoms && symptoms.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Common Symptoms:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {symptoms.map((symptom, index) => (
                    <li key={index} className="text-sm">
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {!isHealthy && (
          <div className="pt-4">
            <Tabs defaultValue="treatment">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="treatment">Treatment Options</TabsTrigger>
                <TabsTrigger value="products">Recommended Products</TabsTrigger>
              </TabsList>

              <TabsContent value="treatment" className="space-y-4 pt-4">
                {treatmentOptions.map((option, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{option.name}</h3>
                      <Badge variant="outline" className="ml-2">
                        {option.effectiveness}% Effective
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <div>
                      <h4 className="text-sm font-medium">
                        Application Method:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {option.applicationMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="products" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productRecommendations.map((product, index) => (
                    <Card key={index} className="overflow-hidden">
                      {product.imageUrl && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant="outline" className="mt-1 mb-2">
                          {product.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {isHealthy && (
          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
            <h3 className="font-medium text-green-700 dark:text-green-400">
              Preventative Care Tips
            </h3>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
              <li>Maintain proper watering schedule - avoid overwatering</li>
              <li>Ensure adequate sunlight exposure for your plant type</li>
              <li>Regularly inspect for early signs of pests or disease</li>
              <li>Apply balanced fertilizer according to plant needs</li>
              <li>Prune dead or damaged parts to promote healthy growth</li>
            </ul>
          </div>
        )}

        {feedbackSubmitted && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Thank you for your feedback! It helps us improve our diagnosis
              system.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <p className="text-sm font-medium">Was this diagnosis helpful?</p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => onFeedbackSubmit?.(true)}
              disabled={feedbackSubmitted}
            >
              <ThumbsUp className="h-4 w-4 mr-1" /> Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => onFeedbackSubmit?.(false)}
              disabled={feedbackSubmitted}
            >
              <ThumbsDown className="h-4 w-4 mr-1" /> No
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4 mr-1" /> Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiagnosisResult;
