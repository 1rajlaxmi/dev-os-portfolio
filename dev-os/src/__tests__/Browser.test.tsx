import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../store/slices/settingsSlice';
import windowManagerReducer from '../store/slices/windowManagerSlice';
import adminReducer from '../store/slices/adminSlice';
import vfsReducer from '../store/slices/vfsSlice';
import { Browser } from '../programs/Browser/Browser';

// Mock PROFILE data
vi.mock('../data/profile', () => ({
  PROFILE: {
    name: 'Rajlaxmi Gupta',
    tagline: 'Full Stack Developer',
    location: 'Patna, Bihar, India',
    bio: 'Test bio',
    role: 'Full Stack Developer Intern @ AIDEOA',
    company: 'AIDEOA',
    education: 'MCA',
    university: 'Central University of Haryana',
    graduationYear: '2024',
    internshipStart: 'October 2024',
    github: 'https://github.com/1rajlaxmi/',
    linkedin: 'https://www.linkedin.com/in/rajlaxmi-cuh/',
    email: 'test@example.com',
    twitter: '',
    techStack: [
      { name: 'React.js', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
      { name: 'Node.js', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    ],
    achievements: [
      { label: 'Problems Solved', value: '400+', platform: 'GFG · HackerRank · LeetCode' },
    ],
    projects: [
      {
        id: 'roomieos',
        title: 'RoomieOS',
        description: 'Real-time room management system.',
        tech: ['React.js', 'Node.js'],
        github: 'https://github.com/1rajlaxmi/RoomieOS',
        live: '',
        color: 'from-indigo-600/30 to-purple-600/30',
        borderColor: 'border-indigo-500/30',
      },
    ],
  },
}));

function createTestStore() {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      windowManager: windowManagerReducer,
      admin: adminReducer,
      vfs: vfsReducer,
    },
    preloadedState: {
      settings: {
        wallpaper: '',
        theme: { hue: 270, sat: 80, lit: 65 },
        themeStyle: 'default' as const,
        is3DEasterEggOpen: false,
        isTourOpen: false,
      },
    },
  });
}

describe('Browser Component — Internal-Only Navigation', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    localStorage.clear();
  });

  // ── Home page ─────────────────────────────────────────────────────────────

  it('should render the DevOS home page by default', () => {
    render(<Provider store={store}><Browser /></Provider>);
    expect(screen.getByText("Rajlaxmi Gupta's DevOS")).toBeInTheDocument();
  });

  it('should show portfolio navigation links on the home page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getAllByText('Projects')[0]).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should show the address bar with correct placeholder text', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    expect(input).toBeInTheDocument();
  });

  it('should have Back and Forward navigation buttons', () => {
    render(<Provider store={store}><Browser /></Provider>);
    expect(screen.getByTitle('Back')).toBeInTheDocument();
    expect(screen.getByTitle('Forward')).toBeInTheDocument();
    expect(screen.getByTitle('Home')).toBeInTheDocument();
    expect(screen.getByTitle('Reload')).toBeInTheDocument();
  });

  it('Back button should be disabled on the initial page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const backBtn = screen.getByTitle('Back');
    expect(backBtn).toBeDisabled();
  });

  // ── Internal navigation ───────────────────────────────────────────────────

  it('clicking "About" quick link should navigate to About page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('Rajlaxmi Gupta')).toBeInTheDocument();
    expect(screen.getByText('Open to Opportunities 🟢')).toBeInTheDocument();
  });

  it('clicking "Projects" quick link should render the Projects page with project cards', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getAllByText('Projects')[0]);
    expect(screen.getByText('RoomieOS')).toBeInTheDocument();
    expect(screen.getByText(/Real-time room management system/i)).toBeInTheDocument();
  });

  it('clicking "Skills" should render the tech stack badges', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getAllByText('Skills')[0]);
    expect(screen.getByText('React.js')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('clicking "Achievements" should render achievement numbers', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getAllByText('Achievements')[0]);
    expect(screen.getByText('400+')).toBeInTheDocument();
    expect(screen.getByText('Problems Solved')).toBeInTheDocument();
  });

  it('clicking "Contact" should render the contact page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getAllByText('Contact')[0]);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('Back button should work after navigating to a page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getAllByText('Projects')[0]);
    expect(screen.getByText('RoomieOS')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Back'));
    // Should be back on home page
    expect(screen.getByText("Rajlaxmi Gupta's DevOS")).toBeInTheDocument();
  });

  it('Forward button should work after going back', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getAllByText('Skills')[0]);
    fireEvent.click(screen.getByTitle('Back'));
    fireEvent.click(screen.getByTitle('Forward'));
    expect(screen.getByText('React.js')).toBeInTheDocument();
  });

  // ── Address bar search / autocomplete ─────────────────────────────────────

  it('typing in address bar should show relevant internal suggestions', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'proj' } });
    // Should suggest "Projects" (matches keyword and label)
    expect(screen.getAllByText('Projects').length).toBeGreaterThan(0);
  });

  it('typing "skill" should suggest the Skills page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'skill' } });
    // Suggestion for Skills should appear
    expect(screen.getAllByText(/Skills/i).length).toBeGreaterThan(0);
  });

  it('typing "dsa" should suggest the DSA Dashboard', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'dsa' } });
    expect(screen.getByText(/DSA Dashboard/i)).toBeInTheDocument();
  });

  it('suggestion dropdown shows devos:// URL for each suggestion', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'about' } });
    expect(screen.getByText('devos://about')).toBeInTheDocument();
  });

  it('pressing Escape should close the suggestions dropdown', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'proj' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    // Dropdown should close
    expect(screen.queryByText('devos://projects')).not.toBeInTheDocument();
  });

  // ── External URL blocking ─────────────────────────────────────────────────

  it('entering an external URL should show the sarcastic blocked page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'https://google.com' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/Nice Try, Explorer/i)).toBeInTheDocument();
  });

  it('entering "www.youtube.com" should trigger the blocked page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'www.youtube.com' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/Nice Try, Explorer/i)).toBeInTheDocument();
    expect(screen.getByText('BLOCKED')).toBeInTheDocument();
  });

  it('entering "github.com" (no https) should trigger the blocked page', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'github.com' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/Nice Try, Explorer/i)).toBeInTheDocument();
  });

  it('blocked page should have a "Back to DevOS Home" button that navigates home', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'https://google.com' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/Nice Try, Explorer/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Back to DevOS Home/i));
    expect(screen.getByText("Rajlaxmi Gupta's DevOS")).toBeInTheDocument();
  });

  it('blocked page should display the attempted external URL', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'https://netflix.com' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText('https://netflix.com')).toBeInTheDocument();
  });

  it('blocked page should show "DevOS Browser Scope" info card', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const input = screen.getByPlaceholderText(/Search DevOS/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'https://twitter.com' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/DevOS Browser Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/portfolio navigator/i)).toBeInTheDocument();
  });

  // ── App launching via browser ─────────────────────────────────────────────

  it('clicking "Resume" in app launcher should dispatch openWindow', () => {
    render(<Provider store={store}><Browser /></Provider>);
    const resumeBtn = screen.getAllByText('Resume').find(
      (el) => el.closest('button')
    );
    fireEvent.click(resumeBtn!.closest('button')!);
    const state = store.getState();
    expect(state.windowManager.windows.find((w: any) => w.appId === 'resume')).toBeDefined();
  });

  it('"Open Full Contact Form" button in contact page should dispatch openWindow for contact', () => {
    render(<Provider store={store}><Browser /></Provider>);
    fireEvent.click(screen.getByText('Contact'));
    fireEvent.click(screen.getByText(/Open Full Contact Form/i));
    const state = store.getState();
    expect(state.windowManager.windows.find((w: any) => w.appId === 'contact')).toBeDefined();
  });
});
