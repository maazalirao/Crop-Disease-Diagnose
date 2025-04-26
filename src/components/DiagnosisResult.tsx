"use client";

import React, { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Printer,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "@/lib/utils";

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
  timestamp?: string;
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
  timestamp,
  onFeedbackSubmit,
  feedbackSubmitted = false,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedImage, setExpandedImage] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card">
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
          text: `Check out my plant diagnosis: ${
            isHealthy ? "Healthy Plant" : diseaseName
          } (${confidenceScore}% confidence)`,
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
      Date: ${timestamp ? new Date(timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
      
      Diagnosis: ${isHealthy ? "Healthy Plant" : diseaseName}
      Plant Type: ${plantType}
      Confidence: ${confidenceScore}%
      
      ${description}
      
      ${
        !isHealthy
          ? `Symptoms:\n${symptoms?.join("\n")}`
          : "No disease symptoms detected."
      }
      
      ${
        !isHealthy
          ? `Recommended Treatments:\n${treatmentOptions
              ?.map((t) => `- ${t.name}: ${t.description}`)
              .join("\n")}`
          : "Continue regular plant care and maintenance."
      }
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

  const handlePrintReport = () => {
    window.print();
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card print:shadow-none" id="diagnosis-result">
      <CardHeader className="print:pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              {isHealthy ? "Healthy Plant Detected" : `Diagnosis: ${diseaseName}`}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant={isHealthy ? "success" : "destructive"} className="text-xs">
                {isHealthy ? (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                ) : (
                  <AlertCircle className="mr-1 h-3 w-3" />
                )}
                {isHealthy ? "Healthy" : "Disease Detected"}
              </Badge>
              <span>Plant Type: {plantType}</span>
              {timestamp && (
                <span className="flex items-center text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatTimestamp(timestamp)}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleDownloadReport}
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handlePrintReport}
            >
              <Printer className="mr-1 h-3 w-3" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleShare}>
              <Share2 className="mr-1 h-3 w-3" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 print:pt-2">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div 
            className={`relative rounded-lg overflow-hidden border ${
              expandedImage ? "lg:w-full" : "lg:w-1/3"
            }`}
          >
            <img
              src={imageUrl}
              alt={isHealthy ? "Healthy Plant" : `Plant with ${diseaseName}`}
              className="w-full h-auto object-cover"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 bg-black/30 text-white hover:bg-black/50 print:hidden"
              onClick={() => setExpandedImage(!expandedImage)}
            >
              {expandedImage ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className={expandedImage ? "hidden lg:block lg:w-2/3" : "lg:w-2/3"}>
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Confidence
                </div>
                <div className="text-2xl font-bold">{confidenceScore}%</div>
              </div>
              <Progress
                value={confidenceScore}
                className={cn("h-3 flex-1", {
                  "bg-green-100": confidenceScore > 80,
                  "bg-yellow-100": confidenceScore > 60 && confidenceScore <= 80,
                  "bg-red-100": confidenceScore <= 60
                })}
              />
            </div>

            <h3 className="font-medium text-lg mb-2">Description</h3>
            <p className="text-muted-foreground mb-4">{description}</p>

            {!isHealthy && symptoms.length > 0 && (
              <>
                <h3 className="font-medium text-lg mb-2">Symptoms</h3>
                <ul className="mb-4 pl-5 list-disc text-muted-foreground">
                  {symptoms.map((symptom, index) => (
                    <li key={index} className="mb-1">
                      {symptom}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <Separator className="my-6 print:hidden" />

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="print:hidden"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="treatments">
              Treatments
            </TabsTrigger>
            <TabsTrigger value="products">
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Plant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Plant Type:</dt>
                      <dd className="text-sm font-medium">{plantType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Diagnosis:</dt>
                      <dd className="text-sm font-medium">
                        {isHealthy ? "Healthy" : diseaseName}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Confidence:</dt>
                      <dd className="text-sm font-medium">{confidenceScore}%</dd>
                    </div>
                    {timestamp && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Date:</dt>
                        <dd className="text-sm font-medium">
                          {formatTimestamp(timestamp)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {isHealthy ? "Health Status" : "Disease Summary"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isHealthy
                      ? "Your plant appears to be healthy. Continue with regular care."
                      : description}
                  </p>
                  {!isHealthy && symptoms.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium mb-2">Key Symptoms:</h4>
                      <ul className="pl-5 list-disc text-sm text-muted-foreground">
                        {symptoms.slice(0, 3).map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                        {symptoms.length > 3 && (
                          <li className="text-primary cursor-pointer" onClick={() => setExpandedImage(false)}>
                            + {symptoms.length - 3} more symptoms
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {!feedbackSubmitted && onFeedbackSubmit && (
              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <h3 className="text-sm font-medium mb-2">Was this diagnosis helpful?</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => onFeedbackSubmit(true)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => onFeedbackSubmit(false)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No
                  </Button>
                </div>
              </div>
            )}

            {feedbackSubmitted && (
              <Alert className="mt-6">
                <AlertDescription>
                  Thank you for your feedback! It helps us improve our diagnosis
                  system.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="treatments" className="mt-6">
            {isHealthy ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Treatment Needed</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your plant appears to be healthy. Continue with regular care and
                  maintenance.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  {treatmentOptions.map((treatment, index) => (
                    <AccordionItem key={index} value={`treatment-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="font-medium">{treatment.name}</span>
                          <Badge
                            variant={
                              treatment.effectiveness > 80
                                ? "success"
                                : treatment.effectiveness > 60
                                  ? "warning"
                                  : "default"
                            }
                            className="ml-2"
                          >
                            {treatment.effectiveness}% Effective
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <p className="text-muted-foreground">
                            {treatment.description}
                          </p>
                          <div>
                            <h4 className="text-sm font-medium">Application Method:</h4>
                            <p className="text-sm text-muted-foreground">
                              {treatment.applicationMethod}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Treatment Tips</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-5 list-disc">
                    <li>Apply treatments consistently as directed for best results</li>
                    <li>
                      Monitor plant response and adjust treatment if necessary
                    </li>
                    <li>
                      Isolate affected plants to prevent spread to healthy plants
                    </li>
                    <li>
                      Continue treatments until symptoms disappear completely
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {isHealthy ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Products Needed</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your plant is healthy! Continue with regular fertilization and care
                  products as part of your maintenance routine.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productRecommendations.map((product, index) => (
                  <Card key={index}>
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={
                          product.imageUrl ||
                          "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=400&q=80"
                        }
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant="outline"
                      >
                        {product.type}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" size="sm" className="text-xs w-full">
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Print version content */}
        <div className="hidden print:block mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Diagnosis Summary</h3>
            <p>{description}</p>
            
            {!isHealthy && (
              <>
                <h3 className="text-lg font-medium">Symptoms</h3>
                <ul className="pl-5 list-disc">
                  {symptoms.map((symptom, i) => (
                    <li key={i}>{symptom}</li>
                  ))}
                </ul>
              </>
            )}
            
            <h3 className="text-lg font-medium">
              {isHealthy ? "Maintenance Recommendations" : "Treatment Recommendations"}
            </h3>
            {isHealthy ? (
              <p>Continue with regular care and maintenance for your healthy plant.</p>
            ) : (
              <ul className="pl-5 list-disc">
                {treatmentOptions.map((treatment, i) => (
                  <li key={i} className="mb-2">
                    <strong>{treatment.name} ({treatment.effectiveness}% Effective):</strong> {treatment.description}
                    <br />
                    <span className="text-sm">Application: {treatment.applicationMethod}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {!isHealthy && (
              <>
                <h3 className="text-lg font-medium">Recommended Products</h3>
                <ul className="pl-5 list-disc">
                  {productRecommendations.map((product, i) => (
                    <li key={i}>
                      <strong>{product.name}</strong> ({product.type}): {product.description}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosisResult;
