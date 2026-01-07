import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f0f0f] pt-32 pb-12 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-[50vh]">
        <div>
          <h2 className="display-font text-[12vw] leading-none text-white opacity-90">
            LET'S TALK
          </h2>
          <div className="mt-8 flex flex-col md:flex-row gap-8">
            <a href="mailto:contact@brivva.com" className="group flex items-center gap-2 text-2xl hover:text-blue-500 transition-colors">
              contact@brivva.com
              <ArrowUpRight className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#" className="group flex items-center gap-2 text-2xl hover:text-blue-500 transition-colors">
              Request Demo
              <ArrowUpRight className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="mt-24 flex flex-col md:flex-row justify-between items-end border-t border-gray-800 pt-8">
          <div className="text-gray-500 text-sm">
            <p>&copy; 2025 Brivva Inc. All rights reserved.</p>
            <p>Bridge the World, Viva Commerce.</p>
          </div>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            {['Instagram', 'LinkedIn', 'Twitter'].map(social => (
              <a key={social} href="#" className="text-gray-400 hover:text-white uppercase text-xs tracking-widest">{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;