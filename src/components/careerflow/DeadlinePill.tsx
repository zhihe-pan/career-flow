import { useEffect, useState } from "react";
import { differenceInHours, differenceInMinutes, differenceInDays } from "date-fns";
import { Clock, AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeadlinePill({ deadline }: { deadline?: string }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const mins = differenceInMinutes(date, now);
  const hours = differenceInHours(date, now);
  const days = differenceInDays(date, now);
  const overdue = mins < 0;
  const urgent = !overdue && hours < 24;

  let text = "";
  if (overdue) {
    const overdueDays = Math.abs(days);
    text = overdueDays > 0 ? `已逾期 ${overdueDays} 天` : `已逾期 ${Math.abs(hours)} 小时`;
  } else if (hours < 1) {
    text = `🔴 即将截止`;
  } else if (hours < 24) {
    text = `🔴 ${hours}小时内截止`;
  } else if (days <= 1) {
    text = `⏳ 明日截止`;
  } else {
    text = `⏳ 倒计时 ${days} 天`;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        "border border-border/60",
        urgent && "border-destructive/70 bg-destructive/20 text-destructive pulse-danger font-semibold",
        overdue && "border-destructive/70 bg-destructive/25 text-destructive font-semibold",
        !urgent && !overdue && days <= 3 && "bg-warning/15 text-warning border-warning/40",
        !urgent && !overdue && days > 3 && "bg-muted/50 text-foreground/85"
      )}
    >
      {urgent || overdue ? <AlarmClock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {text}
    </span>
  );
}
