"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDiseaseInfo } from "@/lib/ml-model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interfaces for the disease data
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

interface DiseaseDetail {
  id: string;
  name: string;
  plantType: string;
  category?: string;
  description: string;
  symptoms: string[];
  treatmentOptions: TreatmentOption[];
  productRecommendations: ProductRecommendation[];
  imageUrl: string;
}

export default function DiseaseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [disease, setDisease] = useState<DiseaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setIsLoading(true);
      // Get disease information
      const diseaseInfo = getDiseaseInfo(id);
      
      // Create a properly typed disease detail object
      setDisease({
        id,
        ...diseaseInfo,
        category: 'Fungal', // Default if not specified
        imageUrl: diseaseInfo.productRecommendations?.[0]?.imageUrl || 
          "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=80"
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching disease details:", err);
      setError("Failed to load disease details");
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
        <div className="mb-6">
          <Link href="/disease-database">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Disease Database
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

  if (error || !disease) {
    return (
      <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
        <div className="mb-6">
          <Link href="/disease-database">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Disease Database
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Error</h3>
                <p className="text-muted-foreground">
                  {error || "Failed to load disease details"}
                </p>
                <Link href="/disease-database">
                  <Button className="mt-4">Return to Disease Database</Button>
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
        <Link href="/disease-database">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Disease Database
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3">
              <div className="h-64 lg:h-full overflow-hidden">
                <img
                  src={disease.imageUrl}
                  alt={disease.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{disease.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>Plant Type: {disease.plantType}</span>
                      <span>•</span>
                      <Badge>{disease.category || 'Fungal'}</Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{disease.description}</p>

                <Tabs defaultValue="symptoms" className="mt-6">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                    <TabsTrigger value="treatments">Treatments</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                  </TabsList>

                  <TabsContent value="symptoms">
                    <h3 className="text-lg font-medium mb-3">Common Symptoms</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      {disease.symptoms.map((symptom: string, index: number) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="treatments">
                    <h3 className="text-lg font-medium mb-3">Treatment Options</h3>
                    <div className="space-y-4">
                      {disease.treatmentOptions.map((treatment: TreatmentOption, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{treatment.name}</h4>
                            <Badge variant="outline">
                              {treatment.effectiveness}% Effective
                            </Badge>
                          </div>
                          <p className="mt-2 text-muted-foreground">
                            {treatment.description}
                          </p>
                          <Separator className="my-2" />
                          <p className="text-sm">
                            <span className="font-medium">Application: </span>
                            {treatment.applicationMethod}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="products">
                    <h3 className="text-lg font-medium mb-3">
                      Recommended Products
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {disease.productRecommendations.map((product: ProductRecommendation, index: number) => (
                        <Card key={index} className="overflow-hidden">
                          <div className="h-40 overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="py-3">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <Badge variant="outline">{product.type}</Badge>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm">{product.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 