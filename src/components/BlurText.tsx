import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delayOffset?: number;
}

export function BlurText({ text, className = "", delayOffset = 0 }: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.1, once: true });

  const words = text.split(" ");

  return (
    <div
      ref={ref}
      className={`flex flex-wrap justify-center font-heading italic text-white ${className}`}
      style={{ rowGap: "0.1em" }}
    >
      {words.map((word, i) => {
        const delay = delayOffset + (i * 100) / 1000;
        return (
          <motion.span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.28em",
            }}
            initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
            animate={
              isInView
                ? {
                    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                    opacity: [0, 0.5, 1],
                    y: [50, -5, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.7,
              times: [0, 0.5, 1],
              ease: "easeOut",
              delay: delay,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
