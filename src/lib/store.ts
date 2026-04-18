import { useEffect, useState, useCallback } from "react";
import type { JobCard, Stage, RoadmapStep } from "./types";
import { normalizeJobCardForStorage } from "./interviewRounds";

const LEGACY_STORAGE_KEY = "careerflow.cards.v4-zh";

// Polyfill: crypto.randomUUID is only available in secure (HTTPS) contexts.
// This fallback ensures it works on plain HTTP (e.g. local dev server).
const randomUUID = (): string => {
  // Pure fallback to ensure it works regardless of crypto object status
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (Math.random() * 16 >> (+c / 4))).toString(16)
  );
};

const KEY = "careerflow.cards.v5-zh-interview";

const seed: JobCard[] = [
  {
    id: randomUUID(),
    company: "字节跳动",
    role: "产品经理 (PM) · AI 方向",
    salary: "¥25k-40k/月 · 16薪",
    location: "北京 · 望京",
    summary: "负责豆包 / 抖音相关 AI 产品方向，参与从 0 到 1 的功能定义与落地。",
    requirements: ["985 / 211 优先", "对 LLM 产品有深度思考", "数据敏感、逻辑清晰"],
    stage: "interviewing",
    createdAt: new Date().toISOString(),
    strategicTier: "safe",
    priority: "🛡️ 保底",
    progressStatus: "二面",
    attachment: "📎 简历-AI向",
    interviewRounds: [
      {
        id: randomUUID(),
        name: "一面",
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
      {
        id: randomUUID(),
        name: "二面",
        scheduledAt: new Date(Date.now() + 17 * 60 * 60 * 1000).toISOString(),
        status: "pending",
      },
    ],
    roadmap: [
      { id: "1", title: "简历定向优化", description: "针对 AI PM 岗位重写项目经历", checklist: [
        { id: "a", text: "量化最近 3 个项目数据", done: true },
        { id: "b", text: "突出 AI / 大模型相关关键词", done: true },
      ]},
      { id: "2", title: "寻找内推", description: "找一位字节在职学长内推", checklist: [
        { id: "a", text: "在脉脉 / 领英联系 2 位 PM", done: true },
      ]},
      { id: "3", title: "面试准备", description: "产品 Sense + 项目深挖演练", checklist: [
        { id: "a", text: "准备 3 个 STAR 故事", done: false },
        { id: "b", text: "复盘豆包 / 即梦产品逻辑", done: false },
      ]},
      { id: "4", title: "Offer 谈判", description: "薪资锚点与意向确认", checklist: [
        { id: "a", text: "调研同级别薪资区间", done: false },
      ]},
      {
        id: "5",
        title: "算法与数据结构",
        description: "链表、二叉树、排序算法",
        checklist: [
          { id: "algo-1", text: "美团、字节跳动高频考点归纳（周练 1 套）", done: false },
        ],
      },
    ],
  },
  {
    id: randomUUID(),
    company: "美团",
    role: "前端开发工程师",
    salary: "¥20k-30k/月",
    location: "北京 · 远程",
    summary: "负责美团到店业务前端架构与性能优化。",
    requirements: ["TypeScript 熟练", "性能优化经验", "审美在线"],
    stage: "applied",
    createdAt: new Date().toISOString(),
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    strategicTier: "safe",
    priority: "🛡️ 保底",
    attachment: "📎 通用简历_v2",
    roadmap: [],
  },
  {
    id: randomUUID(),
    company: "美团",
    role: "AI产品经理",
    salary: "¥28k-45k/月",
    location: "北京 · 望京",
    summary: "负责大模型场景在美团外卖、核心商业等业务的落地架构与功能定义。",
    requirements: ["大语言模型(LLM)实操经验", "对业务转化敏感", "懂算法逻辑"],
    stage: "interviewing",
    createdAt: new Date().toISOString(),
    strategicTier: "core",
    priority: "🎯 核心",
    progressStatus: "二面",
    attachment: "📎 AI-PM深度履历",
    interviewRounds: [
      {
        id: randomUUID(),
        name: "一面",
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
      {
        id: randomUUID(),
        name: "二面",
        scheduledAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        status: "pending",
      },
    ],
    roadmap: [],
  },
  {
    id: randomUUID(),
    company: "腾讯",
    role: "增长产品经理",
    salary: "¥22k-35k/月",
    location: "深圳 · 南山",
    stage: "backlog",
    createdAt: new Date().toISOString(),
    applicationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    roadmap: [],
  },
  {
    id: randomUUID(),
    company: "小红书",
    role: "品牌设计师",
    salary: "¥18k-28k/月",
    location: "上海 · 静安",
    stage: "offer",
    createdAt: new Date().toISOString(),
    roadmap: [],
  },
];

export function useCards() {
  const [cards, setCards] = useState<JobCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) {
        setCards(seed);
      } else {
        const parsed = JSON.parse(raw) as JobCard[];
        setCards(parsed.map(normalizeJobCardForStorage));
      }
    } catch {
      setCards(seed);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(cards));
  }, [cards, loaded]);

  const addCard = useCallback((c: Omit<JobCard, "id" | "createdAt" | "stage" | "roadmap"> & Partial<Pick<JobCard, "stage" | "roadmap">>) => {
    const card: JobCard = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      stage: c.stage ?? "backlog",
      roadmap: c.roadmap ?? [],
      ...c,
    };
    setCards((prev) => [card, ...prev]);
    return card;
  }, []);

  const updateCard = useCallback((id: string, patch: Partial<JobCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const moveCard = useCallback((id: string, stage: Stage) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (stage === "applied" && !c.appliedAt) {
          return { ...c, stage, appliedAt: new Date().toISOString() };
        }
        return { ...c, stage };
      })
    );
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setRoadmap = useCallback((id: string, steps: RoadmapStep[]) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, roadmap: steps } : c)));
  }, []);

  return { cards, loaded, addCard, updateCard, moveCard, removeCard, setRoadmap };
}
