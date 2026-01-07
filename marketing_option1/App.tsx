import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import Pipeline from './components/Pipeline';
import Team from './components/Team';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-white min-h-screen text-gray-900 selection:bg-brand-purple selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <Pipeline />
        <Team />
      </main>
      <Footer />
    </div>
  );
}

export default App;