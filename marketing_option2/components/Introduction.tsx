import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Globe2, Layers } from 'lucide-react';

const Introduction: React.FC = () => {
  return (
    <section className="relative py-24 px-6 md:px-20 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="display-font text-6xl md:text-8xl mb-8 leading-none"
            >
              NO MORE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">BARRIERS.</span>
            </motion.h2>
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              K-Beauty and K-Fashion are exploding globally, but language remains the wall. Subtitles aren't enough—they kill engagement.
            </p>
            <p className="text-lg text-white leading-relaxed">
              Brivva is the first end-to-end platform that translates your voice and syncs your lips in real-time. Speak Korean, be heard in English, Chinese, and Japanese simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
             <FeatureCard 
                icon={<Mic className="w-8 h-8" />}
                title="Voice, Not Text"
                desc="Don't make your customers read. We convert your voice to their native language with matching tone and emotion."
             />
             <FeatureCard 
                icon={<Globe2 className="w-8 h-8" />}
                title="Simulcast Globally"
                desc="One stream feeds Taobao, Amazon, TikTok, and Shopee simultaneously in different languages."
             />
             <FeatureCard 
                icon={<Layers className="w-8 h-8" />}
                title="90% Cost Reduction"
                desc="Forget expensive interpreters or local influencers. Own your brand message directly."
             />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="border-l-2 border-white/20 pl-8 py-2 hover:border-white transition-colors duration-300"
  >
    <div className="mb-2 text-white/80">{icon}</div>
    <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </motion.div>
);

export default Introduction;