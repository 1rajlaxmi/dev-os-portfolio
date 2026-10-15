import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Desktop } from './features/desktop/Desktop';
import { BootScreen } from './components/BootScreen';
import { StatsOverlay } from './components/StatsOverlay';
import { AdminAuthModal } from './components/AdminAuthModal';
import { MobileView } from './components/MobileView';
import { NotFound3D } from './components/NotFound3D';
import { Toaster } from 'sonner';
import { sound } from './utils/sound';

type Phase = 'booting' | 'stats' | 'desktop';

function App() {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('devos_has_booted') === 'true') {
      return 'desktop';
    }
    return 'booting';
  });
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [forceDesktop, setForceDesktop] = useState(false);

  const is404Path =
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('/404') ||
      window.location.pathname.includes('/notfound'));

  // Trigger sound effect on load / refresh
  useEffect(() => {
    sound.playStartupChime();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (is404Path) {
    return (
      <Provider store={store}>
        <NotFound3D standalone onGoHome={() => (window.location.href = '/')} />
      </Provider>
    );
  }

  // On small mobile screens (unless user explicitly requested full desktop OS)
  if (isMobileScreen && !forceDesktop) {
    return (
      <Provider store={store}>
        <MobileView onSwitchToDesktop={() => setForceDesktop(true)} />
        <AdminAuthModal />
        <Toaster theme="dark" position="top-right" />
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      {phase === 'booting' && (
        <BootScreen
          onComplete={() => setPhase('stats')}
          onSkip={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('devos_has_booted', 'true');
            }
            setPhase('desktop');
          }}
        />
      )}
      {phase === 'stats' && (
        <StatsOverlay onComplete={() => setPhase('desktop')} />
      )}
      {phase === 'desktop' && (
        <Desktop />
      )}

      {/* Global Admin Password Authentication Modal */}
      <AdminAuthModal />

      {/* Global Notification System */}
      <Toaster theme="dark" position="top-right" />
    </Provider>
  );
}

export default App;