import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading data...",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-foreground mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
};
