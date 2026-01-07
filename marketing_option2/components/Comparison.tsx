import React from 'react';
import { Check, X, Minus } from 'lucide-react';

const Comparison: React.FC = () => {
  return (
    <section className="py-24 bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-6">
        <h2 className="display-font text-4xl md:text-6xl mb-16 text-center">WHY BRIVVA?</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-6 px-4 font-normal text-gray-400 uppercase tracking-widest text-sm">Feature</th>
                <th className="py-6 px-4 text-2xl font-bold text-white bg-blue-600/20 border-t-2 border-blue-500">BRIVVA</th>
                <th className="py-6 px-4 font-bold text-gray-400">Interpreters</th>
                <th className="py-6 px-4 font-bold text-gray-400">Subtitles AI</th>
                <th className="py-6 px-4 font-bold text-gray-400">Dubbing Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <Row title="Real-time Live" brivva={true} comp1={true} comp2={true} comp3={false} />
              <Row title="Voice Translation" brivva={true} comp1={true} comp2={false} comp3={true} />
              <Row title="AI Lip-Sync" brivva={true} comp1={false} comp2={false} comp3={true} />
              <Row title="Latency" text="< 300ms" text1="1-2 sec" text2="~500ms" text3="N/A (Pre-recorded)" />
              <Row title="Cost Efficiency" text="High" text1="Low (Expensive)" text2="High" text3="Medium" />
              <Row title="Engagement" text="Immersive" text1="Distracting" text2="Low (Reading)" text3="High" />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

interface RowProps {
  title: string;
  brivva?: boolean;
  comp1?: boolean;
  comp2?: boolean;
  comp3?: boolean;
  text?: string;
  text1?: string;
  text2?: string;
  text3?: string;
}

const Row: React.FC<RowProps> = ({ title, brivva, comp1, comp2, comp3, text, text1, text2, text3 }) => {
  const renderCell = (bool?: boolean, txt?: string, isMain?: boolean) => {
    if (txt) return <span className={`font-mono text-sm ${isMain ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>{txt}</span>;
    if (bool === true) return <Check className={`w-6 h-6 ${isMain ? 'text-blue-500' : 'text-gray-500'}`} />;
    if (bool === false) return <X className="w-6 h-6 text-red-900/50" />;
    return <Minus className="w-6 h-6 text-gray-700" />;
  };

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="py-6 px-4 font-bold text-lg">{title}</td>
      <td className="py-6 px-4 bg-blue-600/5 border-l border-r border-blue-600/10">
        {renderCell(brivva, text, true)}
      </td>
      <td className="py-6 px-4">{renderCell(comp1, text1)}</td>
      <td className="py-6 px-4">{renderCell(comp2, text2)}</td>
      <td className="py-6 px-4">{renderCell(comp3, text3)}</td>
    </tr>
  );
};

export default Comparison;