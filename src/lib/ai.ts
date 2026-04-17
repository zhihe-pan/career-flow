import { supabase } from "@/integrations/supabase/client";

export async function aiParseJD(text: string) {
  const { data, error } = await supabase.functions.invoke("ai-assist", {
    body: { mode: "parse_jd", text },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as {
    company: string;
    role: string;
    salary: string;
    location: string;
    requirements: string[];
    summary: string;
  };
}

export async function aiBuildRoadmap(job: {
  company: string;
  role: string;
  requirements?: string[];
  summary?: string;
}) {
  const { data, error } = await supabase.functions.invoke("ai-assist", {
    body: { mode: "roadmap", job },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as {
    steps: { title: string; description: string; checklist: string[] }[];
  };
}
