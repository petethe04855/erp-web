import React from "react";
import { cn } from "@/lib/utils";

interface TwoColumnLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  sidebarWidth?: string;
  className?: string;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  sidebar,
  content,
  sidebarWidth = "w-full lg:w-80",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row gap-6 items-start mt-6",
        className,
      )}
    >
      {/* Column 1: Search & Filter Panel */}
      <aside className={cn("shrink-0", sidebarWidth)}>{sidebar}</aside>

      {/* Column 2: Content & Table Area */}
      <main className="flex-1 w-full min-w-0">{content}</main>
    </div>
  );
};
