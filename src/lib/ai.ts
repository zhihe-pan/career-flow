import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("AI 功能尚未配置。公开演示站未设置 Supabase 环境变量。");
  }
  return supabase;
}

export async function aiParseJD(text: string) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("ai-assist", {
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
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("ai-assist", {
    body: { mode: "roadmap", job },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as {
    steps: { title: string; description: string; checklist: string[] }[];
  };
}
