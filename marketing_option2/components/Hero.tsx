import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const xTextLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const xTextRight = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[120vh] w-full overflow-hidden bg-[#0f0f0f]">
      {/* Background Image Layer */}
      <motion.div 
        style={{ y: yBg }}
        className="absolute inset-0 w-full h-full z-0"
      >
        <div className="relative w-full h-full">
           {/* Placeholder for the user's image.png - Using a high quality live-stream/commerce aesthetic image */}
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop" 
            alt="Live Streamer" 
            className="w-full h-full object-cover opacity-60 grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f0f]" />
        </div>
      </motion.div>

      {/* Floating Text Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center px-4 mix-blend-overlay pointer-events-none">
        {/* We use mix-blend-overlay to let the text interact with the image like the reference */}
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center h-full pt-20">
        <motion.div style={{ x: xTextLeft, opacity }} className="w-full">
          <h1 className="display-font text-[18vw] leading-[0.85] text-white text-left pl-4 md:pl-20 whitespace-nowrap">
            BRIDGE
          </h1>
        </motion.div>
        
        <motion.div style={{ x: xTextRight, opacity }} className="w-full">
          <h1 className="display-font text-[18vw] leading-[0.85] text-white text-right pr-4 md:pr-20 whitespace-nowrap">
            THE WORLD
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-32 md:bottom-20 left-0 w-full px-6 md:px-20 flex flex-col md:flex-row justify-between items-end"
        >
          <div className="max-w-md mb-8 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#ffffff]">
              Global Live Commerce Platform
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Break language barriers. Sell globally in real-time. 
              <br/>Voice translation & Lip-sync technology.
            </p>
          </div>

          <div className="flex gap-4">
            <a href="https://app-brivva.drawdream.ca" className="bg-white text-black px-8 py-4 font-bold tracking-widest hover:bg-gray-200 transition-colors uppercase text-sm">
              Try Now
            </a>
            <div className="border border-white/30 backdrop-blur-sm px-6 py-4 flex flex-col items-center justify-center">
               <span className="text-xs text-gray-400 uppercase">Latency</span>
               <span className="text-xl font-bold font-mono">&lt; 300ms</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;