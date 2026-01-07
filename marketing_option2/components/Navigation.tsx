import React, { useState, useEffect } from 'react';
import { Menu, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-white" />
          <span className="text-xl font-bold tracking-widest">BRIVVA</span>
        </div>

        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <span className="hidden md:block uppercase text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Menu
          </span>
          <Menu className="w-8 h-8 text-white stroke-[1.5]" />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "tween", duration: 0.5, ease: "circOut" }}
            className="fixed inset-0 z-[60] bg-[#ECECEC] text-black flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-bold tracking-widest text-black">BRIVVA</span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-10 h-10 text-black stroke-[1.5]" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6">
              {['Home', 'Technology', 'Solutions', 'Contact'].map((item, i) => (
                <motion.a 
                  key={item}
                  href="#"
                  className="display-font text-6xl md:text-8xl hover:text-gray-500 transition-colors uppercase leading-none"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="text-sm font-mono text-gray-500">
              BRIDGE THE WORLD<br />
              VIVA COMMERCE
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;