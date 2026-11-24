import { AnimatePresence, motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  /** Kept for API compatibility; blur filters are intentionally not applied. */
  blur?: string;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

const BlurFade = ({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  // Default true: only animate when scrolled into view so first paint isn't
  // flooded with simultaneous motion work (that also makes the fixed dock jank).
  inView = true,
  inViewMargin = "-50px",
}: BlurFadeProps) => {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const inViewResult = useInView(ref, {
    once: true,
    ...(inViewMargin ? { margin: inViewMargin as `${number}px` } : {}),
  });
  const isInView = !inView || inViewResult;

  // Opacity/translate only — CSS filter blur forced expensive compositing and
  // contributed to fixed-dock scroll sticking.
  const defaultVariants: Variants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { y: -yOffset, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      };

  const combinedVariants = variant || defaultVariants;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: reducedMotion ? 0 : 0.04 + delay,
          duration: reducedMotion ? 0.01 : duration,
          ease: "easeOut",
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default BlurFade;
