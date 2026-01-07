import React from 'react';
import { motion } from 'framer-motion';
import { COMPARISON_DATA } from '../constants';

const ProblemSolution: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 border-t border-black/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Sticky Left Side */}
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <motion.h2 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-display text-5xl md:text-6xl font-bold mb-6 text-gray-900"
              >
                Local Reach <br />
                <span className="text-gray-400">vs</span> <br />
                Global Scale
              </motion.h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Stop limiting your sales to one language. 
                Brivva turns your local broadcast into a global shopping event without hiring expensive translators.
              </p>
            </div>
          </div>

          {/* Scrolling Right Side */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            {COMPARISON_DATA.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 md:p-12 rounded-2xl bg-white border border-gray-200 hover:border-brand-purple/50 transition-colors overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <h3 className="text-2xl font-bold mb-8 text-gray-400 uppercase tracking-widest">{item.feature}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 uppercase">Without Brivva</span>
                    <p className="text-xl text-gray-400 font-light strike-through decoration-gray-400 line-through">
                      {item.others}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-brand-purple uppercase font-semibold">With Brivva AI</span>
                    <p className="text-3xl font-display font-bold text-gray-900">
                      {item.brivva}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;