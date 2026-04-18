import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/careerflow/KanbanColumn";
import { JobCardItem } from "@/components/careerflow/JobCardItem";
import { AddCardDialog } from "@/components/careerflow/AddCardDialog";
import { CardDetailSheet } from "@/components/careerflow/CardDetailSheet";
import { ActivitySidebar } from "@/components/careerflow/ActivitySidebar";
import { useCards } from "@/lib/store";
import { JobCard, STAGES, Stage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Search, Plus, Focus, Zap, Briefcase, Video, Trophy, Filter, LayoutDashboard, FileText, Calendar, PieChart, Settings, Menu, Users, UserCircle2 } from "lucide-react";
import { differenceInHours } from "date-fns";
import { getFocusUrgentAtIso, getInterviewingSortTimestamp } from "@/lib/cardTimeBadge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ResumeVault } from "@/components/careerflow/ResumeVault";
import { InterviewCalendar } from "@/components/careerflow/InterviewCalendar";
import { PeerForum } from "@/components/PeerForum/PeerForum";
import { Settings as SettingsModule } from "@/components/Settings";
import { FilterTab } from "@/components/ui/filter-tab";

const cleanRoleName = (role: string) => role.split(/[\s·(/-]/)[0];

const Index = () => {
  const { cards, addCard, updateCard, moveCard, removeCard, setRoadmap } = useCards();
  const [adding, setAdding] = useState(false);
  const [active, setActive] = useState<JobCard | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const sidebarItems = [
    { id: "dashboard", label: "看板大厅", icon: LayoutDashboard },
    { id: "resume", label: "简历素材库", icon: FileText },
    { id: "calendar", label: "面试日历", icon: Calendar },
    { id: "forum", label: "同窗交流", icon: Users },
    { id: "settings", label: "设置", icon: Settings },
  ];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const availableRoles = useMemo(() => {
    const roles = cards.map(c => cleanRoleName(c.role));
    return Array.from(new Set(roles)).filter(Boolean);
  }, [cards]);

  const filtered = useMemo(() => {
    let result = cards;
    const q = query.trim().toLowerCase();
    
    if (q) {
      result = result.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q)
      );
    }
    
    if (activeRole) {
      result = result.filter(c => cleanRoleName(c.role) === activeRole);
    }
    
    return result;
  }, [cards, query, activeRole]);

  const { highlightedIds, dimmedIds } = useMemo(() => {
    const highlighted = new Set<string>();
    const dimmed = new Set<string>();
    if (!focusMode) return { highlightedIds: highlighted, dimmedIds: dimmed };
    const urgent = cards
      .filter((c) => {
        const iso = getFocusUrgentAtIso(c);
        if (!iso) return false;
        const h = differenceInHours(new Date(iso), new Date());
        return h <= 48 && h >= 0;
      })
      .sort((a, b) => new Date(getFocusUrgentAtIso(a)!).getTime() - new Date(getFocusUrgentAtIso(b)!).getTime())
      .slice(0, 3);
    urgent.forEach((c) => highlighted.add(c.id));
    cards.forEach((c) => { if (!highlighted.has(c.id)) dimmed.add(c.id); });
    return { highlightedIds: highlighted, dimmedIds: dimmed };
  }, [cards, focusMode]);

  /** 面试中：下一场越早的卡片越靠上；无排期的排在最后（与 CardTimeBadge 同源） */
  const getCardsByStage = useMemo(() => {
    return (stage: Stage) => {
      const base = filtered.filter((c) => c.stage === stage);
      if (stage !== "interviewing") return base;
      return [...base].sort((a, b) => {
        const ta = getInterviewingSortTimestamp(a);
        const tb = getInterviewingSortTimestamp(b);
        if (ta !== tb) return ta - tb;
        return a.company.localeCompare(b.company, "zh-CN");
      });
    };
  }, [filtered]);

  const onDragStart = (e: DragStartEvent) => setDragId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDragId(null);
    const overId = e.over?.id;
    if (!overId) return;
    const stage = STAGES.find((s) => s.id === overId)?.id;
    if (stage) moveCard(String(e.active.id), stage);
  };

  const draggingCard = dragId ? cards.find((c) => c.id === dragId) : null;
  const stats = useMemo(() => ({
    total: cards.length,
    interviewing: cards.filter((c) => c.stage === "interviewing").length,
    offers: cards.filter((c) => c.stage === "offer").length,
  }), [cards]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-screen min-h-0 w-full flex overflow-hidden"
    >
      {/* Sidebar Navigation */}
      <nav className="group relative z-40 flex h-full flex-col py-6 glass shrink-0 transition-all duration-300 ease-in-out w-[72px] lg:hover:w-56 border-r border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center justify-center h-12 mb-6">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex items-center h-12 rounded-xl transition-all duration-200 overflow-hidden",
                  isActive 
                    ? "bg-primary/10 text-primary-glow shadow-glow ring-1 ring-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-center w-[48px] shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "whitespace-nowrap font-medium text-sm transition-opacity duration-300",
                  "opacity-0 lg:group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-glow rounded-r-full shadow-[0_0_8px_hsl(var(--primary-glow))]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-h-0 min-w-0 h-full overflow-hidden relative bg-background/50">
        {/* Global Top Bar */}
        <header className="flex h-16 shrink-0 flex-col justify-center border-b border-white/5 bg-background/40 px-4 backdrop-blur-md sm:px-8 z-40">
          <div className="flex min-h-0 w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow float">
                  <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
                </div>
                <div className="leading-tight hidden sm:block">
                  <h1 className="font-display text-sm font-bold tracking-tight">CareerFlow</h1>
                  <p className="text-[10px] text-muted-foreground">战略驾驶舱</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4 ml-6 pl-6 border-l border-border/50">
                <Stat icon={<Briefcase className="h-3.5 w-3.5" />} label="跟进中" value={stats.total} />
                <Stat icon={<Video className="h-3.5 w-3.5" />} label="面试" value={stats.interviewing} accent />
                <Stat icon={<Trophy className="h-3.5 w-3.5" />} label="获得" value={stats.offers} success />
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="relative hidden md:block max-w-[200px] w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="全局搜索..."
                  className="pl-8 h-9 bg-background/40 border-border/60 text-xs w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/30 border border-border/50 cursor-pointer">
                  <Focus className={`h-3.5 w-3.5 ${focusMode ? "text-primary-glow" : "text-muted-foreground"}`} />
                  <span className="text-[11px] font-medium">专注</span>
                  <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setAdding(true)}
                    className="bg-gradient-primary hover:opacity-90 shadow-glow h-9 gap-1.5"
                    size="sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">✨ AI 智能</span>
                  </Button>

                  <div
                    className="hidden sm:flex items-center gap-1.5 shrink-0 border-l border-white/5 pl-3 ml-0.5"
                    aria-label="作者署名"
                  >
                    <UserCircle2 className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
                    <span className="font-sans text-sm font-medium tracking-tight text-slate-400">
                      by Zhihe Pan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {focusMode && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-4 py-2 flex items-center justify-between shadow-glow border-primary/20 backdrop-blur-lg"
          >
            <div className="flex items-center gap-3 text-[11px] mr-8">
              <span className="h-2 w-2 rounded-full bg-primary-glow animate-pulse" />
              <span className="font-display font-bold uppercase tracking-widest text-[11px] text-primary-glow">专注模式已启用</span>
            </div>
            <button onClick={() => setFocusMode(false)} className="text-[10px] text-muted-foreground hover:text-primary-glow underline underline-offset-2">退出</button>
          </motion.div>
        )}

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeTab === "dashboard" && (
            <div className="flex flex-col h-full overflow-hidden px-4 sm:px-8">
              {/* Role Filters */}
              {availableRoles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3 pb-4 animate-fade-in shrink-0">
                  <FilterTab
                    label="全部"
                    active={activeRole === null}
                    onClick={() => setActiveRole(null)}
                  />
                  {availableRoles.map((role) => (
                    <FilterTab
                      key={role}
                      label={role}
                      active={activeRole === role}
                      onClick={() => setActiveRole(role)}
                    />
                  ))}
                </div>
              )}

              {/* Kanban main content area */}
              <main className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden pb-4">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 h-full w-full pb-8 pr-1">
                    {STAGES.map((s) => (
                      <KanbanColumn
                        key={s.id}
                        id={s.id}
                        label={s.label}
                        accent={s.accent}
                        cards={getCardsByStage(s.id)}
                        highlightedIds={highlightedIds}
                        dimmedIds={dimmedIds}
                        onCardClick={(c) => setActive(c)}
                        onAddCard={s.id === "backlog" ? () => setAdding(true) : undefined}
                      />
                    ))}
                  </div>
                  <DragOverlay>
                    {draggingCard && (
                      <div className="rotate-2 opacity-90">
                        <JobCardItem card={draggingCard} onClick={() => {}} />
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              </main>
            </div>
          )}


    {activeTab === "resume" && (
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto scrollbar-none">
        <ResumeVault poolJobs={cards.filter((c) => c.stage === "backlog")} />
      </main>
    )}

    {activeTab === "forum" && (
      <main className="flex-1 overflow-hidden">
        <PeerForum />
      </main>
    )}

    {activeTab === "calendar" && (
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 sm:px-8 pb-6 pt-2">
        <InterviewCalendar />
      </main>
    )}

    {activeTab === "settings" && (
      <main className="flex-1 overflow-hidden relative">
        <SettingsModule />
      </main>
    )}
        </div>
      {/* End of Main Container */}
      </div>

      <AddCardDialog open={adding} onOpenChange={setAdding} onCreate={(c) => addCard(c as any)} />
      <CardDetailSheet
        card={active ? cards.find((c) => c.id === active.id) ?? null : null}
        onClose={() => setActive(null)}
        onUpdate={updateCard}
        onSetRoadmap={setRoadmap}
        onDelete={removeCard}
      />
    </motion.div>
  );
};

function Stat({ icon, label, value, accent, success }: { icon: React.ReactNode; label: string; value: number; accent?: boolean; success?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span className={`${accent ? "text-primary-glow" : success ? "text-success" : "text-foreground/70"}`}>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold ${accent ? "text-primary-glow" : success ? "text-success" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

export default Index;
