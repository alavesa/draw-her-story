import type { Variants, Transition } from "framer-motion";

// --- Shared transitions ---
export const springBounce: Transition = { type: "spring", stiffness: 300, damping: 20 };

// --- Phase transition variants (for AnimatePresence in Index.tsx) ---
export const phaseVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.25, ease: "easeIn" } },
};

// --- Sub-phase transition variants (within GameScreen) ---
export const subPhaseVariants: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2, ease: "easeIn" } },
};

// --- Chat message slide-in ---
export const chatMessageVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

// --- Button micro-interaction ---
export const buttonTap = { scale: 0.96 };
export const buttonHover = { scale: 1.03 };
export const buttonGlowHover = {
  scale: 1.03,
  boxShadow: "0 0 30px hsl(263 70% 58% / 0.4)",
};

// --- Confetti particle generation ---
export interface ConfettiParticle {
  id: number;
  x: number;
  delay: number;
  size: number;
  color: string;
  rotation: number;
  duration: number;
}

const CONFETTI_COLORS = [
  "hsl(263, 70%, 58%)",
  "hsl(330, 80%, 55%)",
  "hsl(280, 60%, 45%)",
  "hsl(340, 90%, 65%)",
  "hsl(45, 90%, 60%)",
  "hsl(0, 0%, 100%)",
];

export function generateConfetti(count = 40): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: Math.random() * 6 + 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    duration: Math.random() * 1.5 + 1.5,
  }));
}
