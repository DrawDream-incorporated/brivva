import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { NAV_LINKS } from '../constants';

const Navbar: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const [bg, setBg] = useState('bg-transparent');

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    if (latest > 50) {
        setBg('bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm');
    } else {
        setBg('bg-transparent');
    }
  });

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-colors duration-300 ${bg}`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-2xl font-display font-bold text-black tracking-tighter">
            Brivva<span className="text-brand-purple">.</span>
        </a>

        <div className="hidden md:flex gap-8">
            {NAV_LINKS.map(link => (
                <a 
                    key={link.name} 
                    href={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-widest"
                >
                    {link.name}
                </a>
            ))}
        </div>

        <a href="https://app-brivva.drawdream.ca" className="hidden md:block px-6 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg">
            Try Now
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;