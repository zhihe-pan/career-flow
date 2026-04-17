import { useEffect, useState } from "react";
import { differenceInHours, differenceInMinutes, formatDistanceToNowStrict } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeadlinePill({ deadline }: { deadline?: string }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!deadline) return null;
  const date = new Date(deadline);
  const hours = differenceInHours(date, new Date());
  const mins = differenceInMinutes(date, new Date());
  const overdue = mins < 0;
  const urgent = !overdue && hours < 24;
  const text = overdue
    ? `Overdue ${formatDistanceToNowStrict(date)}`
    : `${formatDistanceToNowStrict(date)} left`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium font-mono",
        "border border-border/60",
        urgent && "border-destructive/60 bg-destructive/15 text-destructive pulse-danger",
        overdue && "border-destructive/60 bg-destructive/20 text-destructive",
        !urgent && !overdue && "bg-muted/40 text-muted-foreground"
      )}
    >
      <Clock className="h-3 w-3" />
      {text}
    </span>
  );
}
