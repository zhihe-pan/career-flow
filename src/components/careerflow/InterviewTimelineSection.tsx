import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { InterviewRound, JobCard } from "@/lib/types";
import {
  INTERVIEW_ROUND_PRESETS,
  createInterviewRoundId,
  deriveProgressStatusFromRounds,
  sortInterviewRounds,
} from "@/lib/interviewRounds";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TimelineTrack, TimeLineItem } from "./TimeLineItem";

interface Props {
  card: JobCard;
  onUpdate: (id: string, patch: Partial<JobCard>) => void;
}

/** 与 Stepwise 清单图标一致：3.5 尺寸；选中态为橙色 */
const checkboxInterview = cn(
  "h-3.5 w-3.5 shrink-0 rounded-sm p-0 shadow-none ring-offset-0",
  "border border-orange-400/50 bg-transparent text-white",
  "data-[state=checked]:border-[#FF8C00] data-[state=checked]:bg-[#FF8C00] data-[state=checked]:text-white",
  "focus-visible:ring-1 focus-visible:ring-orange-400/40 focus-visible:ring-offset-0",
  "[&_svg]:h-3 [&_svg]:w-3"
);

const iconAction = "h-4 w-4 text-slate-500 hover:text-slate-200 cursor-pointer";
const datetimeCalendarIconWhite =
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert";

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function InterviewRoundItem({
  round,
  index,
  onUpdateTime,
  onDelete,
  onToggleCompleted,
}: {
  round: InterviewRound;
  index: number;
  onUpdateTime: (id: string, scheduledAt: string | undefined) => void;
  onDelete: (id: string) => void;
  onToggleCompleted: (id: string, completed: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(round.scheduledAt ? isoToDatetimeLocalValue(round.scheduledAt) : "");
    }
  }, [round.scheduledAt, isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const commitEdit = () => {
    const iso = editValue.trim() ? new Date(editValue).toISOString() : undefined;
    const prevIso = round.scheduledAt;
    const changed =
      (iso === undefined && prevIso !== undefined) ||
      (iso !== undefined && prevIso === undefined) ||
      (iso !== undefined && prevIso !== undefined && iso !== prevIso);
    if (changed) {
      onUpdateTime(round.id, iso);
      toast.success("时间已更新");
    }
    setIsEditing(false);
  };

  const completed = round.status === "completed";
  const pending = !completed;

  return (
    <TimeLineItem
      colorTheme="orange"
      nodeKind={completed ? "done" : "active"}
      cardKind={completed ? "done" : "emphasis"}
      compact
      cardClassName="group"
      itemTransition={{ delay: index * 0.04 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground leading-tight shrink-0">{round.name}</h4>
          <span
            className={cn(
              "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border leading-none",
              pending
                ? "bg-orange-500/15 text-orange-400 border-orange-500/35"
                : "bg-muted/30 text-muted-foreground border-border/45"
            )}
          >
            {pending ? "待面试" : "已完成"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            className="rounded p-0.5 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400/40"
            aria-label="删除该轮"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(round.id);
              toast.success(`已删除「${round.name}」`);
            }}
          >
            <Trash2 className={iconAction} />
          </button>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="datetime-local"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitEdit();
                }
                if (e.key === "Escape") {
                  setEditValue(round.scheduledAt ? isoToDatetimeLocalValue(round.scheduledAt) : "");
                  setIsEditing(false);
                }
              }}
              className={cn(
                "h-7 w-full max-w-[200px] rounded-md border border-orange-500/30 bg-background/60 px-2 text-[11px] font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400/50",
                datetimeCalendarIconWhite
              )}
            />
          ) : round.scheduledAt ? (
            <p 
              className="text-[11px] text-muted-foreground font-mono tabular-nums cursor-pointer hover:text-orange-400 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {format(new Date(round.scheduledAt), "yyyy/M/d HH:mm", { locale: zhCN })}
            </p>
          ) : (
            <p 
              className="text-[11px] text-muted-foreground cursor-pointer hover:text-orange-400 transition-colors italic"
              onClick={() => setIsEditing(true)}
            >
              未设置时间
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Checkbox
            id={`interview-round-done-${round.id}`}
            checked={completed}
            onCheckedChange={(v) => onToggleCompleted(round.id, v === true)}
            className={checkboxInterview}
          />
          <Label
            htmlFor={`interview-round-done-${round.id}`}
            className="text-[11px] text-muted-foreground cursor-pointer leading-none select-none"
          >
            标记已完成
          </Label>
        </div>
      </div>
    </TimeLineItem>
  );
}

export function InterviewTimelineSection({ card, onUpdate }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [presetName, setPresetName] = useState<string>(INTERVIEW_ROUND_PRESETS[0]);
  const [datetimeLocal, setDatetimeLocal] = useState("");

  const rounds = card.interviewRounds ?? [];
  const sorted = useMemo(() => sortInterviewRounds(rounds), [rounds]);

  const pushRounds = (next: InterviewRound[]) => {
    onUpdate(card.id, {
      interviewRounds: next,
      progressStatus: deriveProgressStatusFromRounds(next),
    });
  };

  const handleAddRound = () => {
    const scheduledAt = datetimeLocal.trim()
      ? new Date(datetimeLocal).toISOString()
      : undefined;
    const entry: InterviewRound = {
      id: createInterviewRoundId(),
      name: presetName,
      scheduledAt,
      status: "pending",
    };
    pushRounds([...rounds, entry]);
    setAddOpen(false);
    setDatetimeLocal("");
    toast.success(`已添加「${presetName}」`);
  };

  const setRoundCompleted = (id: string, completed: boolean) => {
    const next = rounds.map((r) =>
      r.id === id ? { ...r, status: completed ? ("completed" as const) : ("pending" as const) } : r
    );
    pushRounds(next);
  };

  const updateRoundTime = (id: string, scheduledAt: string | undefined) => {
    pushRounds(rounds.map((r) => (r.id === id ? { ...r, scheduledAt } : r)));
  };

  const deleteRound = (id: string) => {
    pushRounds(rounds.filter((r) => r.id !== id));
  };

  const addTrigger = (
    <PopoverTrigger asChild>
      <button
        type="button"
        className={cn(
          "mt-1 pl-6 text-left text-sm text-slate-400 hover:text-slate-200",
          "flex items-center gap-1 bg-transparent border-none p-0 h-auto min-h-0 font-normal shadow-none",
          "rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400/30"
        )}
      >
        <Plus className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        添加下一轮笔面试
      </button>
    </PopoverTrigger>
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-display font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-orange-400" />
          笔面试时间轴
        </h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2">
        记录每轮安排与完成情况；看板标签会显示当前待完成轮次。
      </p>

      {sorted.length === 0 ? (
        <p className="pl-6 text-[11px] text-muted-foreground leading-relaxed mb-0.5">暂无面试记录。</p>
      ) : (
        <TimelineTrack colorTheme="orange" className="mb-0">
          {sorted.map((r, i) => (
            <InterviewRoundItem
              key={r.id}
              round={r}
              index={i}
              onUpdateTime={updateRoundTime}
              onDelete={deleteRound}
              onToggleCompleted={setRoundCompleted}
            />
          ))}
        </TimelineTrack>
      )}

      <Popover open={addOpen} onOpenChange={setAddOpen}>
        {addTrigger}
        <PopoverContent className="w-80 glass-strong border-white/10 p-4" align="start">
          <div className="space-y-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">面次类型</Label>
              <Select value={presetName} onValueChange={setPresetName}>
                <SelectTrigger className="mt-1 h-9 text-xs bg-background/50 border-border/60">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  {INTERVIEW_ROUND_PRESETS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">时间（可选）</Label>
              <Input
                type="datetime-local"
                value={datetimeLocal}
                onChange={(e) => setDatetimeLocal(e.target.value)}
                className={cn(
                  "mt-1 h-9 text-xs bg-background/50 border-border/60",
                  datetimeCalendarIconWhite
                )}
              />
            </div>
            <Button type="button" className="w-full h-9 bg-gradient-primary shadow-glow text-xs" onClick={handleAddRound}>
              确认添加
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </section>
  );
}
