import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { PROFILE } from '../../data/profile';

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

export interface SkillItem {
  name: string;
  color: string;
}

interface AdminState {
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  projects: ProjectItem[];
  skills: SkillItem[];
}

const SAVED_PROJECTS = localStorage.getItem('devos_projects');
const SAVED_SKILLS = localStorage.getItem('devos_skills');

// Clear any persistent auth flag from legacy testing
try {
  localStorage.removeItem('devos_admin_auth');
} catch {}

const initialState: AdminState = {
  isAuthenticated: false,
  isAuthModalOpen: false,
  projects: SAVED_PROJECTS ? JSON.parse(SAVED_PROJECTS) : [...PROFILE.projects],
  skills: SAVED_SKILLS ? JSON.parse(SAVED_SKILLS) : [...PROFILE.techStack],
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      // Default password admin123
      if (action.payload === 'admin123') {
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
      } else {
        throw new Error('Invalid Password');
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      localStorage.removeItem('devos_admin_auth');
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectItem>) => {
      state.projects.unshift(action.payload);
      localStorage.setItem('devos_projects', JSON.stringify(state.projects));
    },
    updateProject: (state, action: PayloadAction<ProjectItem>) => {
      const idx = state.projects.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.projects[idx] = action.payload;
        localStorage.setItem('devos_projects', JSON.stringify(state.projects));
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      localStorage.setItem('devos_projects', JSON.stringify(state.projects));
    },
    addSkill: (state, action: PayloadAction<SkillItem>) => {
      state.skills.push(action.payload);
      localStorage.setItem('devos_skills', JSON.stringify(state.skills));
    },
    deleteSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter((s) => s.name !== action.payload);
      localStorage.setItem('devos_skills', JSON.stringify(state.skills));
    },
  },
});

export const {
  login,
  logout,
  setAuthModalOpen,
  addProject,
  updateProject,
  deleteProject,
  addSkill,
  deleteSkill,
} = adminSlice.actions;

export default adminSlice.reducer;
