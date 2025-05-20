import React from 'react';
import { Progress } from "@/components/ui/progress";

interface RefreshProgressProps {
  progress: number;
}

export function RefreshProgress({ progress }: RefreshProgressProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-lg">
      <Progress value={progress} className="w-full bg-white [&>div]:bg-progress-bar-fill" />
      <p className="text-sm text-muted-foreground mt-2">
        {progress > 1 
          ? "Refreshing articles list. You can continue your work..."
          : "Loading articles... This may take a few minutes."}
      </p>
    </div>
  );
} 