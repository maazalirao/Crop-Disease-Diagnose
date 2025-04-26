import React from "react";
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

export default function DiseaseDatabasePage() {
  // Mock data for diseases
  const diseases = [
    {
      id: 1,
      name: "Late Blight",
      plantType: "Tomato",
      category: "Fungal",
      severity: "High",
      symptoms: [
        "Dark brown spots on leaves",
        "White fuzzy growth on undersides",
        "Rotting fruit",
      ],
      description:
        "Late blight is a destructive disease affecting tomatoes and potatoes. It spreads rapidly in cool, wet conditions and can destroy crops within days if not treated.",
      treatments: [
        "Apply fungicide preventatively",
        "Remove and destroy infected plants",
        "Improve air circulation",
      ],
      image:
        "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=80",
    },
    {
      id: 2,
      name: "Powdery Mildew",
      plantType: "Cucumber",
      category: "Fungal",
      severity: "Medium",
      symptoms: [
        "White powdery spots on leaves",
        "Yellowing leaves",
        "Stunted growth",
      ],
      description:
        "Powdery mildew is a fungal disease that affects a wide range of plants. It appears as white powdery spots on leaves and stems, and can reduce yield and quality.",
      treatments: [
        "Apply sulfur-based fungicide",
        "Remove infected parts",
        "Increase spacing between plants",
      ],
      image:
        "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=80",
    },
    {
      id: 3,
      name: "Bacterial Leaf Spot",
      plantType: "Pepper",
      category: "Bacterial",
      severity: "Medium",
      symptoms: [
        "Dark, water-soaked spots on leaves",
        "Yellow halos around spots",
        "Defoliation",
      ],
      description:
        "Bacterial leaf spot is caused by various species of bacteria. It creates water-soaked spots on leaves that may turn yellow, brown, or black. Severe infections can cause defoliation.",
      treatments: [
        "Apply copper-based bactericide",
        "Rotate crops",
        "Avoid overhead irrigation",
      ],
      image:
        "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=80",
    },
    {
      id: 4,
      name: "Mosaic Virus",
      plantType: "Squash",
      category: "Viral",
      severity: "High",
      symptoms: [
        "Mottled green/yellow pattern on leaves",
        "Stunted growth",
        "Deformed fruits",
      ],
      description:
        "Mosaic virus causes mottled patterns on leaves and can stunt plant growth. It is spread by aphids and other insects, and there is no cure once a plant is infected.",
      treatments: [
        "Remove and destroy infected plants",
        "Control insect vectors",
        "Plant resistant varieties",
      ],
      image:
        "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=80",
    },
  ];

  // Plant types for filter
  const plantTypes = [
    "All",
    "Tomato",
    "Cucumber",
    "Pepper",
    "Squash",
    "Corn",
    "Potato",
  ];

  // Disease categories for filter
  const categories = [
    "All",
    "Fungal",
    "Bacterial",
    "Viral",
    "Pest",
    "Nutrient Deficiency",
  ];

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
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select defaultValue="All">
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

          <Select defaultValue="All">
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

          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            More Filters
          </Button>
        </div>
      </div>

      {/* View Options */}
      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Disease Catalog</h2>
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </div>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases.map((disease) => (
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
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {diseases.map((disease) => (
              <Card key={disease.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img
                      src={disease.image}
                      alt={disease.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{disease.name}</h3>
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>{disease.plantType}</span>
                      <span>•</span>
                      <span>{disease.category}</span>
                    </div>
                    <p className="mb-4">{disease.description}</p>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">
                        Common Symptoms:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {disease.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button>View Full Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Information Section */}
      <Card className="mt-12 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            About Plant Diseases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Plant diseases can significantly impact crop yield and quality.
            Early detection and proper treatment are essential for effective
            management.
          </p>
          <p>
            This database provides information on common plant diseases, their
            symptoms, and recommended treatments. If you've identified a disease
            in your crops, use our
            <Button variant="link" className="px-1 py-0">
              Disease Detection Tool
            </Button>
            for a more accurate diagnosis and personalized treatment
            recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
