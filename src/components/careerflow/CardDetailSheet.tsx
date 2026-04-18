import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobCard, RoadmapStep, STAGES } from "@/lib/types";
import { aiBuildRoadmap } from "@/lib/ai";
import { notify } from "@/lib/app-toast";
import {
  Wand2,
  Loader2,
  FileText,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  MapPin,
  Wallet,
  ChevronDown,
  Crosshair,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STRATEGIC_TIER_OPTIONS, TIER_CONFIG } from "./JobCardItem";
import { InterviewTimelineSection } from "./InterviewTimelineSection";
import { NextInterviewReadonlyHint } from "./NextInterviewReadonlyHint";
import { TimelineTrack, TimeLineItem } from "./TimeLineItem";

interface Props {
  card: JobCard | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<JobCard>) => void;
  onSetRoadmap: (id: string, steps: RoadmapStep[]) => void;
  onDelete: (id: string) => void;
}

function newEntityId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function RoadmapStepBlock({
  step,
  index,
  cardId,
  roadmap,
  activeStepIdx,
  onSetRoadmap,
  toggleCheck,
  stepMenusPinned,
}: {
  step: RoadmapStep;
  index: number;
  cardId: string;
  roadmap: RoadmapStep[];
  activeStepIdx: number;
  onSetRoadmap: (id: string, steps: RoadmapStep[]) => void;
  toggleCheck: (stepId: string, itemId: string) => void;
  stepMenusPinned: boolean;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(step.title);
  const [editingSubstepId, setEditingSubstepId] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const subInputRef = useRef<HTMLInputElement>(null);

  const active = index === activeStepIdx;
  const done = step.checklist.length > 0 && step.checklist.every((c) => c.done);

  useEffect(() => {
    if (!isEditingTitle) setTitleDraft(step.title);
  }, [step.title, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (editingSubstepId) {
      queueMicrotask(() => subInputRef.current?.focus());
    }
  }, [editingSubstepId]);

  const patchRoadmap = (next: RoadmapStep[]) => {
    onSetRoadmap(cardId, next);
  };

  const commitTitle = () => {
    const t = titleDraft.trim();
    if (!t) {
      setTitleDraft(step.title);
      setIsEditingTitle(false);
      return;
    }
    if (t !== step.title) {
      patchRoadmap(roadmap.map((s) => (s.id === step.id ? { ...s, title: t } : s)));
      notify.success("标题已更新");
    }
    setIsEditingTitle(false);
  };

  const deleteStep = () => {
    patchRoadmap(roadmap.filter((s) => s.id !== step.id));
    notify.success("已删除该步骤");
  };

  const addSubStep = () => {
    const nid = newEntityId();
    patchRoadmap(
      roadmap.map((s) =>
        s.id === step.id
          ? { ...s, checklist: [...s.checklist, { id: nid, text: "新子步骤", done: false }] }
          : s
      )
    );
    notify.success("已添加子步骤");
  };

  const commitSubItem = (itemId: string) => {
    if (editingSubstepId !== itemId) return;
    const original = step.checklist.find((x) => x.id === itemId)?.text ?? "";
    const t = subDraft.trim();
    if (!t) {
      setSubDraft(original);
      setEditingSubstepId(null);
      return;
    }
    if (t !== original) {
      patchRoadmap(
        roadmap.map((s) =>
          s.id !== step.id
            ? s
            : { ...s, checklist: s.checklist.map((x) => (x.id === itemId ? { ...x, text: t } : x)) }
        )
      );
      notify.success("子步骤已更新");
    }
    setEditingSubstepId(null);
  };

  const deleteSubItem = (itemId: string) => {
    patchRoadmap(
      roadmap.map((s) =>
        s.id !== step.id ? s : { ...s, checklist: s.checklist.filter((x) => x.id !== itemId) }
      )
    );
    if (editingSubstepId === itemId) setEditingSubstepId(null);
    notify.success("已删除子步骤");
  };

  return (
    <TimeLineItem
      colorTheme="primary"
      nodeKind={done ? "done" : active ? "active" : "idle"}
      cardKind={active ? "emphasis" : done ? "done" : "subtle"}
      cardClassName="group/step"
      itemTransition={{ delay: index * 0.05 }}
    >
      <div className="flex items-baseline justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitTitle();
                }
                if (e.key === "Escape") {
                  setTitleDraft(step.title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full min-w-0 bg-transparent border-b border-primary/35 text-sm font-semibold text-foreground outline-none focus-visible:border-primary/70 py-0.5"
            />
          ) : (
            <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
          )}
        </div>
        <div className="flex items-baseline gap-1.5 shrink-0">
          {active && (
            <span className="text-[10px] tracking-wider text-primary-glow font-mono font-semibold">
              进行中
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="步骤操作"
                className={cn(
                  "rounded p-0.5 outline-none transition-opacity focus-visible:ring-1 focus-visible:ring-primary/40 cursor-pointer",
                  "opacity-0 group-hover/step:opacity-100",
                  stepMenusPinned && "opacity-100"
                )}
              >
                <MoreVertical className="w-4 h-4 text-slate-500 hover:text-slate-200" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong border-white/10 min-w-[140px]">
              <DropdownMenuItem
                className="text-[13px] cursor-pointer"
                onSelect={() => setIsEditingTitle(true)}
              >
                重命名
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[13px] text-destructive focus:text-destructive cursor-pointer"
                onSelect={deleteStep}
              >
                删除
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem className="text-[13px] cursor-pointer" onSelect={addSubStep}>
                添加子步骤
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{step.description}</p>
      {step.checklist.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {step.checklist.map((c) => (
            <li key={c.id}>
              <div className="group/subitem flex w-full min-w-0 items-start gap-1.5 text-[13px]">
                {editingSubstepId === c.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleCheck(step.id, c.id)}
                      className="shrink-0 mt-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                    >
                      {c.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground group-hover/subitem:text-foreground" />
                      )}
                    </button>
                    <input
                      ref={subInputRef}
                      type="text"
                      value={subDraft}
                      onChange={(e) => setSubDraft(e.target.value)}
                      onBlur={() => commitSubItem(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitSubItem(c.id);
                        }
                        if (e.key === "Escape") {
                          setSubDraft(c.text);
                          setEditingSubstepId(null);
                        }
                      }}
                      className="bg-slate-800 text-slate-200 border border-slate-600 rounded px-2 py-0.5 text-sm flex-1 min-w-0 outline-none"
                    />
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleCheck(step.id, c.id)}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left leading-relaxed text-foreground/85 transition-colors hover:text-foreground"
                    >
                      {c.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover/subitem:text-foreground" />
                      )}
                      <span
                        className={cn("min-w-0 flex-1", c.done && "line-through text-muted-foreground")}
                      >
                        {c.text}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5 pt-0.5 opacity-0 transition-opacity group-hover/subitem:opacity-100">
                      <button
                        type="button"
                        aria-label="编辑子步骤"
                        className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubDraft(c.text);
                          setEditingSubstepId(c.id);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                      </button>
                      <button
                        type="button"
                        aria-label="删除子步骤"
                        className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSubItem(c.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </TimeLineItem>
  );
}

export function CardDetailSheet({ card, onClose, onUpdate, onSetRoadmap, onDelete }: Props) {
  const [building, setBuilding] = useState(false);
  const [reflection, setReflection] = useState(card?.reflection ?? "");
  const [stepwiseMenusPinned, setStepwiseMenusPinned] = useState(false);

  useEffect(() => {
    if (!card) return;
    setStepwiseMenusPinned(false);
  }, [card?.id]);

  if (!card) return null;

  const deadlineInputIso =
    card.stage === "backlog" ? card.applicationDeadline ?? card.deadline : card.deadline;

  const activeStepIdx = (() => {
    const map: Record<string, number> = { backlog: 0, applied: 1, interviewing: 2, offer: 3, closed: 3 };
    return map[card.stage] ?? 0;
  })();

  const handleBuild = async () => {
    setBuilding(true);
    try {
      const { steps } = await aiBuildRoadmap({
        company: card.company,
        role: card.role,
        requirements: card.requirements,
        summary: card.summary,
      });
      const built: RoadmapStep[] = steps.map((s, i) => ({
        id: `${Date.now()}-${i}`,
        title: s.title,
        description: s.description,
        checklist: s.checklist.map((t, j) => ({ id: `${i}-${j}`, text: t, done: false })),
      }));
      onSetRoadmap(card.id, built);
      notify.success("路径已生成 — 出发吧 🚀");
    } catch (e: any) {
      notify.error(e.message || "路径生成失败");
    } finally {
      setBuilding(false);
    }
  };

  const toggleCheck = (stepId: string, itemId: string) => {
    const next = card.roadmap.map((s) =>
      s.id === stepId
        ? { ...s, checklist: s.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)) }
        : s
    );
    onSetRoadmap(card.id, next);
  };

  const saveReflection = () => {
    onUpdate(card.id, { reflection });
    notify.success("复盘已保存");
  };

  return (
    <Sheet open={!!card} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="glass-strong border-l-glass-border w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="p-6 border-b border-border/40 bg-gradient-to-br from-primary/15 via-transparent to-accent/10">
          <SheetHeader>
            <p className="text-xs tracking-widest text-muted-foreground">{card.company}</p>
            <SheetTitle className="font-display text-2xl text-gradient leading-tight">{card.role}</SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            {card.salary && <span className="inline-flex items-center gap-1 text-accent font-mono font-medium"><Wallet className="h-3.5 w-3.5" />{card.salary}</span>}
            {card.location && <span className="inline-flex items-center gap-1 text-foreground/80"><MapPin className="h-3.5 w-3.5" />{card.location}</span>}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                <Crosshair className="h-3 w-3" /> 战略定位
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs font-medium border-border/60 bg-background/40 px-2.5",
                      !card.strategicTier && "text-muted-foreground"
                    )}
                  >
                    {card.strategicTier ? (
                      <>
                        <span>{TIER_CONFIG[card.strategicTier].icon}</span>
                        <span>{TIER_CONFIG[card.strategicTier].label}</span>
                      </>
                    ) : (
                      <span>未定级</span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong border-white/10 min-w-[160px] p-1">
                  {STRATEGIC_TIER_OPTIONS.map((t) => {
                    const c = TIER_CONFIG[t];
                    return (
                      <DropdownMenuItem
                        key={t}
                        className={cn(
                          "flex items-center gap-2 text-[13px] rounded-md px-2.5 py-2 cursor-pointer",
                          card.strategicTier === t && "bg-primary/10 font-semibold"
                        )}
                        onClick={() => {
                          onUpdate(card.id, {
                            strategicTier: t,
                            priority: `${c.icon} ${c.label}`,
                          });
                          notify.success(`已设为「${c.label}」`);
                        }}
                      >
                        <span>{c.icon}</span>
                        <span className="flex-1">
                          {c.label}
                          <span className="text-muted-foreground font-mono text-[11px] ml-1">({t})</span>
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => onUpdate(card.id, { stage: s.id })}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border transition-all",
                  card.stage === s.id
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                    : "border-border/60 text-foreground/70 hover:text-foreground hover:border-border"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {card.stage === "backlog" ? "投递截止" : "截止时间"}
            </Label>
            <Input
              type="datetime-local"
              value={deadlineInputIso ? new Date(deadlineInputIso).toISOString().slice(0, 16) : ""}
              onChange={(e) => {
                const v = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                if (card.stage === "backlog") {
                  onUpdate(card.id, { applicationDeadline: v, deadline: v });
                } else {
                  onUpdate(card.id, { deadline: v });
                }
              }}
              className="mt-1 bg-background/40 border-border/60 text-xs h-8 max-w-[240px]"
            />
          </div>
          {card.stage === "interviewing" && (
            <NextInterviewReadonlyHint rounds={card.interviewRounds} />
          )}
        </div>

        <div className="p-6 space-y-6">
          {card.summary && (
            <section>
              <h3 className="text-sm font-display font-semibold mb-2">岗位概述</h3>
              <p className="text-sm text-foreground/85 leading-relaxed">{card.summary}</p>
              {card.requirements && card.requirements.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {card.requirements.map((r, i) => (
                    <li key={i} className="text-[13px] text-foreground/80 flex items-start gap-2 leading-relaxed">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {card.stage === "interviewing" && (
            <InterviewTimelineSection card={card} onUpdate={onUpdate} />
          )}

          <section>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                <h3 className="text-sm font-display font-semibold flex items-center gap-1.5 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Stepwise 路径拆解
                </h3>
                {card.roadmap.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStepwiseMenusPinned((p) => !p)}
                    className="inline-flex items-center gap-0.5 text-xs text-slate-500 hover:text-slate-200 cursor-pointer shrink-0"
                  >
                    <Pencil className="h-3 w-3" aria-hidden />
                    编辑拆解
                  </button>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={handleBuild} disabled={building} className="h-7 text-xs shrink-0">
                {building ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Wand2 className="h-3 w-3 mr-1" /> {card.roadmap.length ? "重新生成" : "AI 生成"}</>}
              </Button>
            </div>

            {card.roadmap.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center">
                <p className="text-xs text-foreground/70 mb-3 leading-relaxed">还没有路径规划。让 AI 为这个目标拆解出可执行的关键节点。</p>
                <Button onClick={handleBuild} disabled={building} className="bg-gradient-primary shadow-glow">
                  {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="h-4 w-4 mr-2" />一键拆解为目标</>}
                </Button>
              </div>
            ) : (
              <>
                <TimelineTrack colorTheme="primary">
                  {card.roadmap.map((step, i) => (
                    <RoadmapStepBlock
                      key={step.id}
                      step={step}
                      index={i}
                      cardId={card.id}
                      roadmap={card.roadmap}
                      activeStepIdx={activeStepIdx}
                      onSetRoadmap={onSetRoadmap}
                      toggleCheck={toggleCheck}
                      stepMenusPinned={stepwiseMenusPinned}
                    />
                  ))}
                </TimelineTrack>
                <div className="pl-6 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newStep: RoadmapStep = {
                        id: newEntityId(),
                        title: "新步骤",
                        description: "",
                        checklist: [],
                      };
                      onSetRoadmap(card.id, [...card.roadmap, newStep]);
                      notify.success("已添加步骤");
                    }}
                    className="w-full inline-flex items-center justify-start gap-1.5 text-sm text-slate-400 hover:text-slate-200 py-2 px-4 rounded-md bg-transparent border-dashed border border-slate-700/50 hover:border-slate-500"
                  >
                    <span className="text-base leading-none font-normal" aria-hidden>
                      +
                    </span>
                    添加新步骤
                  </button>
                </div>
              </>
            )}
          </section>

          <section>
            <h3 className="text-sm font-display font-semibold mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> 简历版本库
            </h3>
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-foreground/70">
              拖入用于此次申请的简历版本
              <p className="mt-1 text-[10px] opacity-70">PDF 预览 · 即将上线</p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-display font-semibold mb-2">AI 复盘助手</h3>
            <Textarea
              placeholder="这次面试感受如何？哪些问题让你措手不及？AI 会帮你总结优劣势。"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[100px] bg-background/40 border-border/60 text-sm leading-relaxed"
            />
            <Button size="sm" onClick={saveReflection} variant="secondary" className="mt-2">
              保存复盘
            </Button>
          </section>

          <div className="pt-4 border-t border-border/40 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => { onDelete(card.id); onClose(); }} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> 删除
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
