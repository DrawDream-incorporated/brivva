import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { ArrowUp, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [bgImage, setBgImage] = useState<string | null>(null);
  
  const yText = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const generateHeroBackground = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{
              text: 'A professional, bright, and modern live streaming studio setup. High-tech camera gear, ring lights, and multiple monitors displaying analytics. Clean white workspace, soft daylight, shallow depth of field, bright and airy aesthetic. 8k resolution, photorealistic.'
            }]
          },
          config: {
             imageConfig: {
                 aspectRatio: "16:9"
             }
          }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              setBgImage(`data:image/png;base64,${part.inlineData.data}`);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Failed to generate background:", error);
      }
    };

    generateHeroBackground();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-white text-black overflow-hidden pt-20">
      {/* 1. Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* Fallback Gradient */}
        <div className="absolute inset-0 bg-gray-50" />
        
        {/* AI Generated Image */}
        {bgImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        
        {/* Light Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>

      {/* 2. Main Grid Layout */}
      <div className="relative z-10 h-full flex flex-col justify-between container mx-auto border-x border-black/10">
        
        {/* Top Section: Massive Typography */}
        <div className="flex-grow grid grid-cols-12 relative">
            <div className="col-span-12 lg:col-span-8 flex flex-col justify-center px-6 lg:px-12 pt-12">
                <motion.h1 
                    style={{ y: yText }}
                    className="text-[15vw] lg:text-[11vw] leading-[0.8] font-display font-bold uppercase tracking-tighter text-black"
                >
                    Sell<br/>
                    To The<br/>
                    World
                </motion.h1>
            </div>

            {/* Right Side Text Block (Desktop) */}
            <div className="hidden lg:col-span-4 lg:flex flex-col justify-center p-8 text-right items-end">
                <p className="max-w-xs text-xl font-medium leading-snug mb-8 drop-shadow-sm text-gray-800">
                    SPEAK IN YOUR LANGUAGE. SELL IN THEIRS. THE FIRST AI TOOL FOR GLOBAL LIVE COMMERCE.
                </p>
                <button className="group bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-black transition-all flex items-center gap-2 shadow-lg">
                    Start Selling
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>

        {/* Bottom Grid Section: Specs & Marquee */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 border-t border-black/10 bg-white/60 backdrop-blur-md">
            
            {/* Spec Box 1 */}
            <div className="col-span-2 lg:col-span-3 p-6 border-r border-black/10 border-b lg:border-b-0">
                <h3 className="font-display font-bold text-xl uppercase mb-2">Speed</h3>
                <div className="grid grid-cols-2 text-xs font-mono gap-y-1 text-gray-500">
                    <span>TIMING:</span> <span className="text-black font-semibold">INSTANT</span>
                    <span>FEEL:</span> <span className="text-black font-semibold">REAL-TIME</span>
                    <span>LAG:</span> <span className="text-black font-semibold">NONE</span>
                </div>
            </div>

            {/* Spec Box 2 */}
            <div className="col-span-2 lg:col-span-3 p-6 lg:border-r border-black/10 border-b lg:border-b-0">
                <h3 className="font-display font-bold text-xl uppercase mb-2">Quality</h3>
                <div className="grid grid-cols-2 text-xs font-mono gap-y-1 text-gray-500">
                    <span>VISUAL:</span> <span className="text-black font-semibold">PERFECT LIP-SYNC</span>
                    <span>AUDIO:</span> <span className="text-black font-semibold">YOUR VOICE</span>
                    <span>LANG:</span> <span className="text-black font-semibold">ANY COUNTRY</span>
                </div>
            </div>

            {/* Marquee / Action Strip */}
            <div className="col-span-4 lg:col-span-6 p-6 flex items-center justify-between bg-black text-white">
                <span className="font-display font-bold text-lg md:text-xl uppercase tracking-widest truncate">
                    EXPAND * YOUR * MARKET * NOW * 
                </span>
                <div className="flex gap-4">
                    <ArrowUp className="w-5 h-5" />
                    <ArrowUp className="w-5 h-5" />
                    <ArrowUp className="w-5 h-5" />
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;