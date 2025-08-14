import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export type DeltaType = "increase" | "decrease" | "unchanged";

interface BadgeDeltaProps extends React.HTMLAttributes<HTMLDivElement> {
  deltaType: DeltaType;
  children?: React.ReactNode;
}

export function BadgeDelta({
  deltaType,
  className,
  children,
  ...props
}: BadgeDeltaProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        deltaType === "increase" && "bg-emerald-900/20 text-emerald-400",
        deltaType === "decrease" && "bg-rose-900/20 text-rose-400",
        deltaType === "unchanged" && "bg-slate-800 text-slate-400",
        className
      )}
      {...props}
    >
      {deltaType === "increase" ? (
        <ArrowUpIcon className="mr-1 h-3 w-3" />
      ) : deltaType === "decrease" ? (
        <ArrowDownIcon className="mr-1 h-3 w-3" />
      ) : (
        <ArrowRightIcon className="mr-1 h-3 w-3" />
      )}
      {children}
    </div>
  );
}
