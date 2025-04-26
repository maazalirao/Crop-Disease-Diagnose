"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { getDiagnosisHistory, deleteDiagnosisFromHistory } from "@/lib/api";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { DiagnosisResult } from "@/lib/api";

export default function HistoryPage() {
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const historyData = await getDiagnosisHistory();
        
        // Sort by timestamp (newest first)
        const sortedHistory = [...historyData].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        setHistory(sortedHistory);
      } catch (err) {
        console.error("Error loading history:", err);
        setError("Failed to load diagnosis history");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [];

  const handleDelete = async (id: string) => {
    try {
      await deleteDiagnosisFromHistory(id);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting history item:", err);
      setError("Failed to delete diagnosis record");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Diagnosis History</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-64 bg-muted rounded"></div>
              <div className="h-32 w-full max-w-md bg-muted rounded"></div>
              <div className="h-32 w-full max-w-md bg-muted rounded"></div>
            </div>
          </div>
        ) : history.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No diagnosis history</h3>
                <p className="text-muted-foreground">
                  You haven't analyzed any plants yet. Start by uploading a
                  plant image.
                </p>
                <Link href="/diagnosis">
                  <Button className="mt-2">Diagnose a Plant</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img
                      src={item.imageUrl}
                      alt="Plant"
                      className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">
                        {item.isHealthy ? "Healthy Plant" : item.diseaseName}
                      </h3>
                      <Badge
                        variant={item.isHealthy ? "default" : "destructive"}
                      >
                        {item.isHealthy ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Healthy
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Disease
                          </span>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>Plant Type: {item.plantType}</span>
                      <span>•</span>
                      <span>Confidence: {item.confidenceScore}%</span>
                      <span>•</span>
                      <span>
                        {format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <Link href={`/diagnosis/${item.id}`}>
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete diagnosis record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this diagnosis record from your
                              history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
