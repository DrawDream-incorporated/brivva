import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tighter">Brivva</h3>
          <p className="text-gray-500 text-sm mt-2">© 2025 Brivva Inc. All rights reserved.</p>
        </div>
        
        <div className="flex gap-8 text-sm text-gray-500">
          <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;