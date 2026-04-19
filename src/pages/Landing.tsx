import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 m-0 p-0 w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#020205]">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-15%] w-[65%] h-[65%] rounded-full bg-violet-600/25 blur-[160px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[-15%] right-[-20%] w-[55%] h-[55%] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse" style={{ animationDelay: "3s", animationDuration: '11s' }} />
        <div className="absolute top-[35%] left-[35%] w-[35%] h-[35%] rounded-full bg-blue-600/10 blur-[110px] animate-pulse" style={{ animationDelay: "5s", animationDuration: '8s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center gap-6"
      >
        {/* ─── HERO LOGO (180% bigger) ─── */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
          className="relative mb-2"
        >
          {/* Ambient glow behind logo */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-violet-500/50 blur-[50px] scale-[1.6] animate-pulse" style={{ animationDuration: '6s' }} />
          {/* Logo card */}
          <div
            className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-[2.5rem] flex items-center justify-center float"
            style={{ boxShadow: '0 0 40px rgba(128, 0, 200, 0.55), 0 0 80px rgba(100, 0, 180, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)' }}
          >
            {/* Glassmorphic surface */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20" />
            <Zap className="h-14 w-14 sm:h-18 sm:w-18 text-white relative z-10 drop-shadow-lg" fill="currentColor" style={{ filter: 'drop-shadow(0 0 12px rgba(180,100,255,0.8))' }} />
            <Sparkles className="absolute -top-3 -right-3 h-6 w-6 sm:h-8 sm:w-8 text-violet-300/90 animate-pulse" style={{ animationDuration: '2.5s' }} />
          </div>
        </motion.div>

        {/* ─── HERO TEXT — 3 lines only ─── */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Line 1: Brand name – metal gradient */}
          <h1
            className="text-6xl sm:text-8xl font-display font-black tracking-tight leading-none"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #818cf8 70%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            CareerFlow
          </h1>

          {/* Line 2: Tagline */}
          <p className="text-xl sm:text-2xl font-medium text-white/70 tracking-wide">
            你的智能求职副驾
          </p>
        </motion.div>

        {/* ─── CTA BUTTON — tight below tagline ─── */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="relative group mt-4"
        >
          {/* Pulsing outer glow ring */}
          <div className="absolute -inset-2 rounded-full bg-violet-500/30 blur-xl animate-pulse group-hover:bg-violet-500/50 transition-all duration-500" />

          {/* Star particles */}
          <motion.span animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute -top-5 -left-5 text-violet-300 text-[10px]">✶</motion.span>
          <motion.span animate={{ y: [0, 8, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, delay: 1, repeat: Infinity }} className="absolute -bottom-4 -right-5 text-indigo-300">✨</motion.span>
          <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} className="absolute top-1/2 -right-10 text-violet-400/70 text-xs">✶</motion.span>

          <Button
            onClick={handleStart}
            size="lg"
            className="relative z-10 bg-white/8 hover:bg-white/15 border border-white/25 backdrop-blur-2xl text-white font-bold text-base sm:text-lg px-10 py-6 rounded-full shadow-[0_4px_24px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Shimmer sweep on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
            <span className="tracking-wide relative z-10">开启你的求职之旅</span>
            <ChevronRight className="h-5 w-5 bg-white/15 rounded-full p-0.5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 text-[10px] text-white/20 uppercase tracking-[0.25em]"
      >
        Powered by Stepwise Methodology
      </motion.p>
    </div>
  );
};

export default Landing;
