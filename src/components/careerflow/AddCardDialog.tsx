import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Wand2, Check } from "lucide-react";
import { aiParseJD } from "@/lib/ai";
import { JobCard } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (c: Partial<JobCard>) => void;
}

export function AddCardDialog({ open, onOpenChange, onCreate }: Props) {
  const [tab, setTab] = useState("ai");
  // manual
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  // ai
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Awaited<ReturnType<typeof aiParseJD>> | null>(null);

  const reset = () => {
    setCompany(""); setRole(""); setText(""); setParsed(null); setLoading(false); setTab("ai");
  };

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const p = await aiParseJD(text);
      setParsed(p);
      toast.success("Parsed! Review and save.");
    } catch (e: any) {
      toast.error(e.message || "Failed to parse");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAi = () => {
    if (!parsed) return;
    onCreate({
      company: parsed.company,
      role: parsed.role,
      salary: parsed.salary,
      location: parsed.location,
      requirements: parsed.requirements,
      summary: parsed.summary,
    });
    onOpenChange(false);
    reset();
  };

  const handleSaveManual = () => {
    if (!company.trim() || !role.trim()) return;
    onCreate({ company, role });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="glass-strong border-glass-border max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-glow" />
            Add a new application
          </DialogTitle>
          <DialogDescription>
            Capture an opportunity in seconds — manually, or paste the chaotic JD and let AI structure it.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-2 w-full bg-muted/40">
            <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Wand2 className="h-3.5 w-3.5 mr-1.5" /> AI Smart Paste
            </TabsTrigger>
            <TabsTrigger value="manual">Quick Add</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-3 mt-4">
            {!parsed ? (
              <>
                <Textarea
                  placeholder="Paste the messy job description here — from BOSS, LinkedIn, anywhere..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[180px] bg-background/50 border-border/60 font-mono text-xs"
                />
                <Button
                  onClick={handleParse}
                  disabled={!text.trim() || loading}
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> Parse with AI</>}
                </Button>
              </>
            ) : (
              <div className="space-y-2.5 text-sm animate-fade-in">
                <Field label="Company" value={parsed.company} onChange={(v) => setParsed({ ...parsed, company: v })} />
                <Field label="Role" value={parsed.role} onChange={(v) => setParsed({ ...parsed, role: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Salary" value={parsed.salary} onChange={(v) => setParsed({ ...parsed, salary: v })} />
                  <Field label="Location" value={parsed.location} onChange={(v) => setParsed({ ...parsed, location: v })} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Summary</Label>
                  <p className="text-sm mt-1 p-2.5 rounded-lg bg-muted/30 border border-border/40">{parsed.summary}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Requirements</Label>
                  <ul className="mt-1.5 space-y-1">
                    {parsed.requirements.map((r, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5 text-muted-foreground">
                        <Check className="h-3 w-3 mt-0.5 text-accent shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setParsed(null)} className="flex-1">Re-parse</Button>
                  <Button onClick={handleSaveAi} className="flex-1 bg-gradient-primary shadow-glow">
                    Add to board
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-3 mt-4">
            <Field label="Company" value={company} onChange={setCompany} placeholder="e.g. Stripe" />
            <Field label="Role" value={role} onChange={setRole} placeholder="e.g. Senior Designer" />
            <Button
              onClick={handleSaveManual}
              disabled={!company.trim() || !role.trim()}
              className="w-full bg-gradient-primary shadow-glow"
            >
              Add to backlog
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 bg-background/50 border-border/60"
      />
    </div>
  );
}
