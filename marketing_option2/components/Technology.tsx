import React from 'react';
import { motion } from 'framer-motion';

const Technology: React.FC = () => {
  const steps = [
    { id: '01', title: 'Whisper STT', desc: 'Real-time Streaming Speech-to-Text with 95% accuracy on commerce terms.' },
    { id: '02', title: 'Context NMT', desc: 'Neural Machine Translation preserving context and brand nuances.' },
    { id: '03', title: 'Emotive TTS', desc: 'Synthesizing voice that retains the host\'s original excitement and tone.' },
    { id: '04', title: 'AI Lip-Sync', desc: 'Wav2Lip technology modifies video frames to match the new language.' },
  ];

  return (
    <section className="py-32 bg-white text-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          {/* Abstract Grid Background */}
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="border border-black px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">The Core Engine</span>
          <h2 className="display-font text-5xl md:text-7xl mt-6">
            &lt; 300ms LATENCY
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-gray-600">
            Our GPU-accelerated pipeline processes voice, translation, and video modification faster than the human perception threshold.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative h-80 border-t border-black p-6 flex flex-col justify-between hover:bg-black hover:text-white transition-all duration-500 cursor-default"
            >
              <div>
                <span className="text-4xl font-bold font-mono opacity-30 group-hover:opacity-100 transition-opacity">{step.id}</span>
                <h3 className="text-2xl font-bold mt-4 mb-2 leading-tight uppercase">{step.title}</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-70 group-hover:opacity-100">
                {step.desc}
              </p>
              
              {/* Connecting Line Visual */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 w-8 h-[1px] bg-black group-hover:bg-transparent z-10"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technology;