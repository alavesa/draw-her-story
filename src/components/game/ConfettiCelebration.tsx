import { motion, AnimatePresence } from "framer-motion";
import { generateConfetti, type ConfettiParticle } from "@/lib/animations";
import { useState, useEffect } from "react";

interface Props {
  trigger: boolean;
}

export default function ConfettiCelebration({ trigger }: Props) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setParticles(generateConfetti(40));
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: -20,
                rotate: p.rotation,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: p.rotation + 720,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
