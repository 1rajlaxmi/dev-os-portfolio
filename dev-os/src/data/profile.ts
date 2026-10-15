// ============================================================
//  PROFILE DATA — Single Source of Truth
//  Re-exports data from src/data/profile.json across the app
// ============================================================

import profileData from './profile.json';

export interface TechStackItem {
  name: string;
  color: string;
}

export interface AchievementItem {
  label: string;
  value: string;
  platform: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  color: string;
  borderColor: string;
}

export interface ProfileType {
  name: string;
  tagline: string;
  role: string;
  company: string;
  internshipStart: string;
  education: string;
  graduationYear: string;
  university: string;
  location: string;
  bio: string;
  github: string;
  linkedin: string;
  email: string;
  twitter: string;
  techStack: TechStackItem[];
  achievements: AchievementItem[];
  projects: ProjectItem[];
}

export const PROFILE: ProfileType = profileData;
