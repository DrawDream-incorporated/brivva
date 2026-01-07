import { Mic, Zap, Globe, Cpu, Video } from 'lucide-react';
import { ComparisonItem, Milestone, TeamMember, Feature } from './types';

export const NAV_LINKS = [
  { name: 'How it Works', href: '#technology' },
  { name: 'Benefits', href: '#solutions' },
  { name: 'Expansion', href: '#roadmap' },
  { name: 'Team', href: '#team' },
];

export const FEATURES: Feature[] = [
  {
    id: '1',
    title: 'Instant Translation',
    description: 'Speak naturally in your language. We translate it instantly so your global customers hear you in theirs.',
    icon: Mic,
  },
  {
    id: '2',
    title: 'Natural Lip-Sync',
    description: 'We match your lip movements to the translated audio. It looks and feels like you are speaking their language.',
    icon: Video,
  },
  {
    id: '3',
    title: 'Global Broadcasting',
    description: 'Stream once, sell everywhere. Push your live stream to TikTok, Amazon, and Shopee simultaneously.',
    icon: Globe,
  },
  {
    id: '4',
    title: 'Sales-Optimized AI',
    description: 'Our AI understands product terms and sales slang, ensuring your pitch is persuasive in every language.',
    icon: Zap,
  },
];

export const COMPARISON_DATA: ComparisonItem[] = [
  {
    feature: 'Market Reach',
    brivva: 'Global (Any Language)',
    others: 'Local (Native Only)',
  },
  {
    feature: 'Customer Connection',
    brivva: 'High (They hear you)',
    others: 'Low (Reading subtitles)',
  },
  {
    feature: 'Cost',
    brivva: 'Affordable Subscription',
    others: 'Expensive Interpreters',
  },
  {
    feature: 'Sales Conversion',
    brivva: '3x Higher Engagement',
    others: 'Limited by Language',
  }
];

export const ROADMAP: Milestone[] = [
  {
    date: 'Dec 2025',
    title: 'Beta Launch',
    description: 'Helping K-Beauty brands sell directly to customers in China. Pilot program live.',
    active: true,
  },
  {
    date: 'Jun 2026',
    title: 'Western Expansion',
    description: 'Launching English & Spanish support. Direct integration with Amazon Live & TikTok US.',
    active: false,
  },
  {
    date: 'Dec 2026',
    title: 'Enterprise Retail',
    description: 'Custom solutions for major fashion houses and global retail chains.',
    active: false,
  },
  {
    date: 'Jun 2027',
    title: 'Global Dominance',
    description: 'Full support for Southeast Asian markets (Vietnam, Thailand, Indonesia).',
    active: false,
  },
];

export const TEAM: TeamMember[] = [
  {
    name: 'Minju Park',
    role: 'CEO',
    description: '15 years in global commerce. Led market entry strategies for top beauty brands generating $200M+ revenue.',
    image: 'https://picsum.photos/400/500?grayscale&random=1',
  },
  {
    name: 'Gil-dong Hong',
    role: 'CTO',
    description: 'AI expert focused on natural speech. Ensuring your brand voice stays authentic in every language.',
    image: 'https://picsum.photos/400/500?grayscale&random=2',
  },
  {
    name: 'Sarah Kim',
    role: 'Head of Sales',
    description: 'Veteran Showhost with 5,000+ hours live. Knows exactly what tools sellers need to close the deal.',
    image: 'https://picsum.photos/400/500?grayscale&random=3',
  },
];