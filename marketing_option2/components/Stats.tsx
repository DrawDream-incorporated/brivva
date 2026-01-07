import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  return (
    <div className="bg-blue-600 py-12 overflow-hidden whitespace-nowrap">
      <motion.div 
        className="inline-flex gap-16 items-center"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(3)].map((_, i) => (
          <React.Fragment key={i}>
            <StatItem label="MARKET SIZE" value="$700B" />
            <span className="text-4xl text-black/30">///</span>
            <StatItem label="COST SAVINGS" value="90%" />
            <span className="text-4xl text-black/30">///</span>
            <StatItem label="ACCURACY" value="95%+" />
            <span className="text-4xl text-black/30">///</span>
            <StatItem label="PLATFORMS" value="UNLIMITED" />
            <span className="text-4xl text-black/30">///</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex flex-col md:flex-row items-baseline gap-4">
    <span className="text-2xl font-bold text-black/60">{label}</span>
    <span className="display-font text-6xl md:text-8xl text-white">{value}</span>
  </div>
);

export default Stats;