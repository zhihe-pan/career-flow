import { forwardRef } from "react";
import { JobCard, StrategicTier } from "@/lib/types";
import { getLatestPendingRoundName } from "@/lib/interviewRounds";
import { useDraggable } from "@dnd-kit/core";
import { CardTimeBadge } from "./CardTimeBadge";
import { MapPin, Wallet, Route, Paperclip, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ---- Strategic Tier config ----
export const TIER_CONFIG: Record<StrategicTier, { label: string; icon: string; classes: string }> = {
  reach:  { label: "冲刺",   icon: "🚀", classes: "bg-rose-500/15 text-rose-300   border-rose-500/30" },
  core:   { label: "核心",   icon: "🎯", classes: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  safe:   { label: "保底",   icon: "🛡️", classes: "bg-blue-500/15   text-blue-300   border-blue-500/30" },
};

export const STRATEGIC_TIER_OPTIONS: StrategicTier[] = ["reach", "core", "safe"];

interface Props {
  card: JobCard;
  dimmed?: boolean;
  highlighted?: boolean;
  onClick: () => void;
  hoverShadow?: string;
}

export const JobCardItem = forwardRef<HTMLDivElement, Props>(
  ({ card, dimmed, highlighted, onClick, hoverShadow }, ref) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: card.id,
    });

    const totalChecks = card.roadmap.reduce((acc, s) => acc + s.checklist.length, 0);
    const doneChecks = card.roadmap.reduce(
      (acc, s) => acc + s.checklist.filter((i) => i.done).length,
      0
    );
    const pct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;

    const interviewPillLabel =
      card.stage === "interviewing"
        ? getLatestPendingRoundName(card.interviewRounds) ?? card.progressStatus
        : null;

    const style = transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        ref={ref}
      >
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={(e) => {
            if (isDragging) return;
            onClick();
            e.stopPropagation();
          }}
          className={cn(
            "group relative cursor-grab active:cursor-grabbing select-none",
            "rounded-2xl p-4 glass transition-all duration-300",
            "hover:-translate-y-1 hover:bg-white/[0.06]",
            hoverShadow || "hover:shadow-glow",
            isDragging && "opacity-60 rotate-1 scale-105 shadow-glow z-50",
            highlighted && "gradient-border ring-1 ring-primary/30",
            dimmed && "focus-dim"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground mb-1.5 min-w-0">
                <span className="min-w-0 flex-1 truncate">{card.company}</span>
                <motion.span
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300",
                    card.strategicTier
                      ? TIER_CONFIG[card.strategicTier].classes
                      : "bg-muted/35 text-muted-foreground border-border/50"
                  )}
                >
                  {card.strategicTier ? (
                    <>
                      {TIER_CONFIG[card.strategicTier].icon}{" "}
                      {TIER_CONFIG[card.strategicTier].label}
                    </>
                  ) : (
                    "未定级"
                  )}
                </motion.span>
              </p>
              <h3 className="font-display text-[15px] font-semibold leading-snug text-foreground truncate flex items-center gap-2">
                {card.role}
              </h3>
            </div>
            
            <div className="flex flex-col items-end gap-1.5">
              <CardTimeBadge card={card} />
              {interviewPillLabel && (
                <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  {interviewPillLabel}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
            {card.salary && (
              <span className="inline-flex items-center gap-1 font-mono text-accent font-medium">
                <Wallet className="h-3.5 w-3.5" />
                {card.salary}
              </span>
            )}
            {card.location && (
              <span className="inline-flex items-center gap-1 text-foreground/75">
                <MapPin className="h-3.5 w-3.5" />
                {card.location}
              </span>
            )}
            {card.attachment && (
              <span className="inline-flex items-center gap-1 text-white/40 text-[11px] hover:text-white/70 transition-colors">
                <Paperclip className="h-3 w-3" />
                {card.attachment}
              </span>
            )}
          </div>

          {totalChecks > 0 && (
            <div className="mt-3.5">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Route className="h-3 w-3" /> Stepwise 路径
                </span>
                <span className="font-mono font-semibold text-foreground/90">{pct}% 通关</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

JobCardItem.displayName = "JobCardItem";
