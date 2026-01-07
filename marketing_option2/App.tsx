import React from 'react';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Technology from './components/Technology';
import Comparison from './components/Comparison';
import Stats from './components/Stats';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-[#0f0f0f] text-white selection:bg-white selection:text-black">
      <Navigation />
      <Hero />
      <Introduction />
      <Technology />
      <Stats />
      <Comparison />
      <Footer />
    </div>
  );
};

export default App;