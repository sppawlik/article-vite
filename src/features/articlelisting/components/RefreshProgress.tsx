import React from 'react';
import { Progress } from "@/components/ui/progress";

interface RefreshProgressProps {
  progress: number;
}

export function RefreshProgress({ progress }: RefreshProgressProps) {
  return (
    <div className="px-4">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-muted-foreground mt-2">
        {progress > 1 
          ? "You can start working while we finish loading the articles in the background."
          : "Loading articles... This may take a few minutes."}
      </p>
    </div>
  );
} 