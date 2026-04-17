import { JobCard } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";
import { DeadlinePill } from "./DeadlinePill";
import { MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  card: JobCard;
  dimmed?: boolean;
  highlighted?: boolean;
  onClick: () => void;
}

export function JobCardItem({ card, dimmed, highlighted, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const totalChecks = card.roadmap.reduce((acc, s) => acc + s.checklist.length, 0);
  const doneChecks = card.roadmap.reduce(
    (acc, s) => acc + s.checklist.filter((i) => i.done).length,
    0
  );
  const pct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
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
          "rounded-2xl p-3.5 glass transition-all duration-300",
          "hover:-translate-y-0.5 hover:shadow-glow",
          isDragging && "opacity-60 rotate-1 scale-105 shadow-glow z-50",
          highlighted && "flow-border",
          dimmed && "focus-dim"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
              {card.company}
            </p>
            <h3 className="font-display text-[15px] font-semibold leading-tight text-foreground truncate">
              {card.role}
            </h3>
          </div>
          <DeadlinePill deadline={card.deadline} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {card.salary && (
            <span className="inline-flex items-center gap-1 font-mono text-accent">
              <Briefcase className="h-3 w-3" />
              {card.salary}
            </span>
          )}
          {card.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {card.location}
            </span>
          )}
        </div>

        {totalChecks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Roadmap</span>
              <span className="font-mono text-foreground/80">{pct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
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
