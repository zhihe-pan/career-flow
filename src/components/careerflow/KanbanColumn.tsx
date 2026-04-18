import { Stage, JobCard, STAGES } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import { JobCardItem } from "./JobCardItem";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface Props {
  id: Stage;
  label: string;
  accent: string;
  cards: JobCard[];
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onCardClick: (c: JobCard) => void;
  /** 传入时在该列卡片列表顶部显示「录入新机会」主按钮（看板大厅中仅用于「我的备选池」） */
  onAddCard?: () => void;
}

export function KanbanColumn({ id, label, accent, cards, highlightedIds, dimmedIds, onCardClick, onAddCard }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  const stageConfig = STAGES.find(s => s.id === id)!;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full overflow-hidden rounded-3xl glass-strong p-3 transition-all duration-300",
        "border-t-2", stageConfig.borderColor,
        isOver && "ring-2 ring-primary/60 shadow-glow scale-[1.01]"
      )}
    >
      <div className="flex items-center gap-2 px-2 pb-3">
        <span className={cn("h-2 w-2 shrink-0 rounded-full bg-gradient-to-br", accent)} />
        <h2 className="font-display min-w-0 truncate text-sm font-semibold tracking-wide">{label}</h2>
        <span className="shrink-0 text-[10px] font-mono text-muted-foreground">{cards.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto [overflow-y:overlay] scrollbar-none space-y-2.5 pb-2 pr-1">
        {onAddCard && (
          <button
            type="button"
            onClick={onAddCard}
            className="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 py-3 text-sm font-medium text-indigo-400 transition-all duration-300 hover:border-indigo-500/60 hover:bg-indigo-500/15 hover:text-indigo-300"
            aria-label="录入新机会"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            录入新机会
          </button>
        )}
        <AnimatePresence initial={false}>
          {cards.map((c) => (
            <JobCardItem
              key={c.id}
              card={c}
              highlighted={highlightedIds.has(c.id)}
              dimmed={dimmedIds.has(c.id)}
              onClick={() => onCardClick(c)}
              hoverShadow={stageConfig.hoverShadow}
            />
          ))}
        </AnimatePresence>
        {cards.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-border/50 text-[11px] font-medium text-muted-foreground px-4 text-center leading-relaxed">
            {stageConfig.emptyText}
          </div>
        )}
      </div>
    </div>
  );
}
