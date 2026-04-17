import { useEffect, useState, useCallback } from "react";
import type { JobCard, Stage, RoadmapStep } from "./types";

const KEY = "careerflow.cards.v1";

const seed: JobCard[] = [
  {
    id: crypto.randomUUID(),
    company: "Anthropic",
    role: "Product Designer, AI",
    salary: "$180-240K",
    location: "Remote · SF",
    summary: "Design intuitive interfaces for advanced AI products.",
    requirements: ["5+ yrs product design", "Systems thinking", "AI/ML curiosity"],
    stage: "interviewing",
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    roadmap: [
      { id: "1", title: "Resume Tailoring", description: "Sharpen for AI-product narrative", checklist: [
        { id: "a", text: "Quantify last 3 projects", done: true },
        { id: "b", text: "Add AI keywords", done: true },
      ]},
      { id: "2", title: "Outreach", description: "Find a warm intro", checklist: [
        { id: "a", text: "Message 2 designers on LinkedIn", done: true },
      ]},
      { id: "3", title: "Interview Prep", description: "Portfolio walkthrough rehearsal", checklist: [
        { id: "a", text: "Record portfolio walkthrough", done: false },
        { id: "b", text: "Prepare 3 STAR stories", done: false },
      ]},
      { id: "4", title: "Offer & Negotiation", description: "Anchor expectations", checklist: [
        { id: "a", text: "Research comp bands", done: false },
      ]},
    ],
  },
  {
    id: crypto.randomUUID(),
    company: "Linear",
    role: "Senior Frontend Engineer",
    salary: "$190-230K",
    location: "Remote",
    summary: "Build the fastest project tracker on the web.",
    requirements: ["TypeScript wizard", "Performance obsessed", "Design taste"],
    stage: "applied",
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    roadmap: [],
  },
  {
    id: crypto.randomUUID(),
    company: "Stripe",
    role: "Growth PM",
    salary: "$170-210K",
    location: "Dublin",
    stage: "backlog",
    createdAt: new Date().toISOString(),
    roadmap: [],
  },
  {
    id: crypto.randomUUID(),
    company: "Figma",
    role: "Brand Designer",
    salary: "$140-180K",
    location: "NYC",
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
      const raw = localStorage.getItem(KEY);
      setCards(raw ? JSON.parse(raw) : seed);
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
      id: crypto.randomUUID(),
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
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setRoadmap = useCallback((id: string, steps: RoadmapStep[]) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, roadmap: steps } : c)));
  }, []);

  return { cards, loaded, addCard, updateCard, moveCard, removeCard, setRoadmap };
}
