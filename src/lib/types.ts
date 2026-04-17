export type Stage = "backlog" | "applied" | "interviewing" | "offer" | "closed";

export const STAGES: { id: Stage; label: string; accent: string }[] = [
  { id: "backlog", label: "Backlog", accent: "from-slate-400/40 to-slate-300/10" },
  { id: "applied", label: "Applied", accent: "from-blue-400/50 to-cyan-300/10" },
  { id: "interviewing", label: "Interviewing", accent: "from-violet-400/60 to-fuchsia-300/10" },
  { id: "offer", label: "Offer", accent: "from-emerald-400/60 to-teal-300/10" },
  { id: "closed", label: "Closed", accent: "from-zinc-500/40 to-zinc-400/10" },
];

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  checklist: { id: string; text: string; done: boolean }[];
}

export interface JobCard {
  id: string;
  company: string;
  role: string;
  salary?: string;
  location?: string;
  requirements?: string[];
  summary?: string;
  jdUrl?: string;
  stage: Stage;
  deadline?: string; // ISO
  createdAt: string;
  roadmap: RoadmapStep[];
  reflection?: string;
  reflectionSummary?: string;
}
