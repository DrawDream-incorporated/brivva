import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Globe, Cpu, Video, ArrowRight } from 'lucide-react';

const steps = [
  { id: 'STT', label: 'You Speak', sub: 'In your native language', icon: Mic },
  { id: 'NMT', label: 'We Translate', sub: 'Instantly & accurately', icon: Globe },
  { id: 'TTS', label: 'We Dub', sub: 'Keeping your emotion', icon: Cpu },
  { id: 'LIP', label: 'We Sync', sub: 'For natural viewing', icon: Video },
];

const Pipeline: React.FC = () => {
  return (
    <section id="technology" className="py-32 bg-white relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-brand-purple font-bold tracking-widest uppercase mb-4 block"
          >
            How It Works
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold text-gray-900"
          >
            Speak Once, Sell Everywhere
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2 }}
                className="relative group w-full lg:w-64"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-xl opacity-30 group-hover:opacity-100 blur transition duration-500"></div>
                <div className="relative h-full bg-gray-50 rounded-xl p-8 flex flex-col items-center text-center border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-brand-purple">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.label}</h3>
                  <p className="text-sm text-gray-500">{step.sub}</p>
                </div>
              </motion.div>
              
              {idx < steps.length - 1 && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 + 0.1 }}
                    className="hidden lg:block text-gray-400"
                >
                    <ArrowRight size={24} />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mt-24 p-8 border border-gray-200 rounded-2xl bg-gray-50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left">
                    <h4 className="text-2xl font-bold mb-2 text-gray-900">Why It Matters</h4>
                    <p className="text-gray-600 max-w-xl">
                        Trust is the key to sales. When customers hear you in their own language, conversion rates triple compared to simple subtitles. We handle the technology so you can focus on your product.
                    </p>
                </div>
                <div className="flex gap-4">
                     <span className="px-4 py-2 rounded bg-white text-xs font-mono border border-gray-200 text-gray-600 shadow-sm">Seamless</span>
                     <span className="px-4 py-2 rounded bg-white text-xs font-mono border border-gray-200 text-gray-600 shadow-sm">High Quality</span>
                     <span className="px-4 py-2 rounded bg-white text-xs font-mono border border-gray-200 text-gray-600 shadow-sm">Instant</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Pipeline;