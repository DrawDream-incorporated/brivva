import { LucideIcon } from 'lucide-react';

export interface ComparisonItem {
  feature: string;
  brivva: string;
  others: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface Milestone {
  date: string;
  title: string;
  description: string;
  active?: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}