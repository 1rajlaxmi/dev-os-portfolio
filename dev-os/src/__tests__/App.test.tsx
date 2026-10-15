import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '../App';

describe('DevOS App Root Component Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render BootScreen on initial load and transition to Desktop after boot finishes', () => {
    render(<App />);

    // Initial state shows BootScreen branding and phase label
    expect(screen.getByText(/Initializing BIOS/i)).toBeInTheDocument();
    expect(screen.getByText(/DEVOS v2.0/i)).toBeInTheDocument();

    // Advance boot screen timer
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Click Enter DevOS on StatsOverlay screen
    act(() => {
      screen.getByText(/Enter DevOS/i).click();
    });

    // After boot sequence finishes, Desktop environment elements appear
    expect(screen.getByText(/Recruiter Tour/i)).toBeInTheDocument();
    expect(screen.getAllByText(/DevOS/i).length).toBeGreaterThan(0);
  });
});
