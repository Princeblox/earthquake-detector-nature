import { FadingVideo } from "./FadingVideo";
import { motion } from "motion/react";
import { Globe, Cpu, Volume2 } from "lucide-react";

export function Capabilities() {
  const cards = [
    {
      title: "Global Detection",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 25k 256" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
        </svg>
      ),
      tags: ["Natural Context", "Photo Realism", "Infinite Settings", "Eco-Vibe"],
      body: "AI-driven worldwide sensor matrix monitoring Earth's lithospheric plates 24/7/365, mapping tremors in real-time from Icelandic canyons to remote Pacific trenches."
    },
    {
      title: "Predictive Intelligence",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
        </svg>
      ),
      tags: ["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"],
      body: "Frees historical data bottlenecks. Processes deep tremor signals in minutes, utilizing complex convolutional networks to detect subtle slip activities."
    },
    {
      title: "Instant Alerts",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
        </svg>
      ),
      tags: ["Ray Tracing", "Physical Shadows", "Studio Quality", "Sunlight Sync"],
      body: "High-integrity dispatch framework. Instantly sends tailored push and audio alerts to coordinates within proximity fields of active seismological epicenters."
    }
  ];

  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col justify-center">
      {/* Background Loop Video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Capabilities Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-32 pb-16 flex flex-col justify-between min-h-screen">
        
        {/* Section Header */}
        <div className="mb-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-sm font-body tracking-widest text-white/50 uppercase mb-4">
              // Capabilities & Seismology Tech Spec
            </p>
            <h2 className="font-heading italic text-white text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.8] tracking-[-3px]">
              Production
              <br />
              evolved.
            </h2>
          </motion.div>
        </div>

        {/* 3 Premium Glass Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, delay: idx * 0.2, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="liquid-glass rounded-[1.25rem] p-6 lg:p-8 min-h-[360px] flex flex-col justify-between transition-all duration-300"
            >
              {/* Card Header row */}
              <div className="flex items-start justify-between gap-4">
                {/* SVG nesting square */}
                <div className="h-11 w-11 shrink-0 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white">
                  {card.icon}
                </div>

                {/* Tag pill filters */}
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {card.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="rounded-full liquid-glass border border-white/5 px-2.5 py-0.5 text-[9px] text-white/70 font-body whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Title and Descriptive Copy */}
              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1.5px] leading-none mb-4">
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-white/80 font-body font-light leading-relaxed max-w-[32ch]">
                  {card.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
