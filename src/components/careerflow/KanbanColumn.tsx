import { Stage, JobCard } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import { JobCardItem } from "./JobCardItem";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

interface Props {
  id: Stage;
  label: string;
  accent: string;
  cards: JobCard[];
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onCardClick: (c: JobCard) => void;
}

export function KanbanColumn({ id, label, accent, cards, highlightedIds, dimmedIds, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[300px] shrink-0 rounded-3xl glass-strong p-3 transition-all duration-300 max-h-[calc(100vh-180px)]",
        isOver && "ring-2 ring-primary/60 shadow-glow scale-[1.01]"
      )}
    >
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full bg-gradient-to-br", accent)} />
          <h2 className="font-display text-sm font-semibold tracking-wide">{label}</h2>
          <span className="text-[10px] font-mono text-muted-foreground">{cards.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2.5 pb-2 pr-1">
        <AnimatePresence mode="popLayout">
          {cards.map((c) => (
            <JobCardItem
              key={c.id}
              card={c}
              highlighted={highlightedIds.has(c.id)}
              dimmed={dimmedIds.has(c.id)}
              onClick={() => onCardClick(c)}
            />
          ))}
        </AnimatePresence>
        {cards.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-border/50 text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
