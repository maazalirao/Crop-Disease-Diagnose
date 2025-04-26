"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { getAllDiseaseInfo } from "@/lib/ml-model";

export default function DiseaseDatabasePage() {
  const [diseases, setDiseases] = useState<any[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlantType, setSelectedPlantType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Load disease data from ML model
  useEffect(() => {
    const diseaseData = getAllDiseaseInfo();
    
    // Transform the data to match the expected format
    const formattedDiseases = Object.entries(diseaseData).map(([id, info], index) => {
      return {
        id: index + 1,
        diseaseId: id,
        name: info.name,
        plantType: info.plantType,
        category: info.category || "Fungal", // Default to Fungal if not specified
        severity: info.severity || "Medium", // Default to Medium if not specified
        symptoms: info.symptoms || [],
        description: info.description,
        treatments: info.treatmentOptions?.map(t => t.name) || [],
        image: info.imageUrl || `https://images.unsplash.com/photo-159851${Math.floor(1000000 + Math.random() * 9000000)}?w=600&q=80`,
      };
    });
    
    setDiseases(formattedDiseases);
    setFilteredDiseases(formattedDiseases);
    setIsLoading(false);
  }, []);

  // Filter diseases based on search term and filters
  useEffect(() => {
    let result = [...diseases];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        disease => 
          disease.name.toLowerCase().includes(lowerSearch) || 
          disease.description.toLowerCase().includes(lowerSearch) ||
          disease.symptoms.some((s: string) => s.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply plant type filter
    if (selectedPlantType !== "All") {
      result = result.filter(disease => disease.plantType === selectedPlantType);
    }
    
    // Apply category filter
    if (selectedCategory !== "All") {
      result = result.filter(disease => disease.category === selectedCategory);
    }
    
    setFilteredDiseases(result);
  }, [searchTerm, selectedPlantType, selectedCategory, diseases]);

  // Collect unique plant types from the data
  const plantTypes = ["All", ...new Set(diseases.map(d => d.plantType))];

  // Disease categories
  const categories = [
    "All",
    "Fungal",
    "Bacterial",
    "Viral",
    "Pest",
    "Nutrient Deficiency",
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 bg-background">
        <h1 className="text-3xl font-bold mb-6">Plant Disease Database</h1>
        <div className="flex justify-center py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-64 bg-muted rounded"></div>
            <div className="h-32 w-full max-w-md bg-muted rounded"></div>
            <div className="h-32 w-full max-w-md bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <h1 className="text-3xl font-bold mb-6">Plant Disease Database</h1>
      <p className="text-muted-foreground mb-8">
        Browse our comprehensive database of plant diseases, symptoms, and
        treatment recommendations.
      </p>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search diseases by name or symptom"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select 
            value={selectedPlantType} 
            onValueChange={setSelectedPlantType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Plant Type" />
            </SelectTrigger>
            <SelectContent>
              {plantTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Disease Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* No Results */}
      {filteredDiseases.length === 0 && (
        <Card className="text-center py-12 mb-8">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <Info className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-medium">No diseases found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPlantType("All");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Options */}
      {filteredDiseases.length > 0 && (
        <Tabs defaultValue="grid" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Disease Catalog ({filteredDiseases.length} results)
            </h2>
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiseases.map((disease) => (
                <Card key={disease.id} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={disease.image}
                      alt={disease.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{disease.name}</CardTitle>
                      <Badge
                        variant={
                          disease.severity === "High"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {disease.severity} Severity
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span>{disease.plantType}</span>
                      <span>•</span>
                      <span>{disease.category}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-3">{disease.description}</p>
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-1">
                        Common Symptoms:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {disease.symptoms.slice(0, 2).map((symptom, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {symptom}
                          </Badge>
                        ))}
                        {disease.symptoms.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{disease.symptoms.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/disease-detail/${disease.diseaseId}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-0">
            <div className="space-y-4">
              {filteredDiseases.map((disease) => (
                <Card key={disease.id}>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 h-40 md:h-auto">
                      <img
                        src={disease.image}
                        alt={disease.name}
                        className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{disease.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{disease.plantType}</span>
                            <span>•</span>
                            <span>{disease.category}</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            disease.severity === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {disease.severity} Severity
                        </Badge>
                      </div>
                      <p className="line-clamp-2 my-3">{disease.description}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-sm font-medium mb-1">
                            Top Symptoms:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {disease.symptoms.slice(0, 3).map((symptom, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {symptom}
                              </Badge>
                            ))}
                            {disease.symptoms.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{disease.symptoms.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/disease-detail/${disease.diseaseId}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
