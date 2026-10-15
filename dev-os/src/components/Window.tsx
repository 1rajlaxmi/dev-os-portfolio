import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Minus, Square, Copy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import {
  closeWindow,
  focusWindow,
  toggleMinimize,
  toggleMaximize,
  updateGeometry,
  type WindowState,
} from '../store/slices/windowManagerSlice';
import { sound } from '../utils/sound';

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const EDGE_CURSOR: Record<ResizeEdge, string> = {
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
  ne: 'nesw-resize', nw: 'nwse-resize',
  se: 'nwse-resize', sw: 'nesw-resize',
};

const MIN_W = 320;
const MIN_H = 220;
const SNAP_THRESHOLD = 28; // px from edge to trigger snap preview

type SnapZone = 'top' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

function getSnapZone(x: number, y: number): SnapZone {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const T = SNAP_THRESHOLD;
  const atTop    = y <= T;
  const atLeft   = x <= T;
  const atRight  = x >= W - T;
  const atBottom = y >= H - T;

  if (atTop && atLeft)     return 'top-left';
  if (atTop && atRight)    return 'top-right';
  if (atBottom && atLeft)  return 'bottom-left';
  if (atBottom && atRight) return 'bottom-right';
  if (atTop)               return 'top';
  if (atLeft)              return 'left';
  if (atRight)             return 'right';
  return null;
}

function snapGeometry(zone: SnapZone, topBarH = 32) {
  const W = window.innerWidth;
  const H = window.innerHeight - topBarH;
  switch (zone) {
    case 'top':          return { x: 0,     y: topBarH, w: W,     h: H };
    case 'left':         return { x: 0,     y: topBarH, w: W / 2, h: H };
    case 'right':        return { x: W / 2, y: topBarH, w: W / 2, h: H };
    case 'top-left':     return { x: 0,     y: topBarH, w: W / 2, h: H / 2 };
    case 'top-right':    return { x: W / 2, y: topBarH, w: W / 2, h: H / 2 };
    case 'bottom-left':  return { x: 0,     y: topBarH + H / 2, w: W / 2, h: H / 2 };
    case 'bottom-right': return { x: W / 2, y: topBarH + H / 2, w: W / 2, h: H / 2 };
    default:             return null;
  }
}

// Snap overlay colors
const SNAP_OVERLAY_CLASS = 'fixed pointer-events-none z-[99999] bg-indigo-500/20 border-2 border-indigo-400/60 rounded-xl backdrop-blur-sm transition-all duration-150';

export const Window = ({ windowState, children }: WindowProps) => {
  const dispatch = useAppDispatch();
  const themeStyle = useAppSelector((state) => state.settings.themeStyle || 'default');
  const { geometry } = windowState;

  const [pos,  setPos]  = useState({ x: geometry.x, y: geometry.y });
  const [size, setSize] = useState({ w: geometry.width, h: geometry.height });
  const [snapZone, setSnapZone] = useState<SnapZone>(null);

  // Active resize edge state for render cursor overlay
  const [activeResizeEdge, setActiveResizeEdge] = useState<ResizeEdge | null>(null);

  useEffect(() => {
    setPos((prev) => (prev.x === geometry.x && prev.y === geometry.y ? prev : { x: geometry.x, y: geometry.y }));
    setSize((prev) => (prev.w === geometry.width && prev.h === geometry.height ? prev : { w: geometry.width, h: geometry.height }));
  }, [geometry.x, geometry.y, geometry.width, geometry.height]);

  // ── Dragging + Snap preview ───────────────────────────────────────────────
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.initX + dx, y: Math.max(0, dragRef.current.initY + dy) });
      setSnapZone(getSnapZone(e.clientX, e.clientY));
    };

    const onUp = (e: MouseEvent) => {
      setIsDragging(false);
      const zone = getSnapZone(e.clientX, e.clientY);
      setSnapZone(null);

      if (zone) {
        sound.playWindowSnap();
        if (zone === 'top') {
          // Snap to fullscreen via maximize flag
          dispatch(toggleMaximize(windowState.id));
        } else {
          const g = snapGeometry(zone);
          if (g) {
            setPos({ x: g.x, y: g.y });
            setSize({ w: g.w, h: g.h });
            dispatch(updateGeometry({ id: windowState.id, geometry: { x: g.x, y: g.y, width: g.w, height: g.h } }));
          }
        }
      } else {
        setPos((p) => {
          dispatch(updateGeometry({ id: windowState.id, geometry: { x: p.x, y: p.y } }));
          return p;
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging, dispatch, windowState.id]);

  // ── Resizing ──────────────────────────────────────────────────────────────
  const resizeRef = useRef<{
    edge: ResizeEdge; startX: number; startY: number;
    initX: number; initY: number; initW: number; initH: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeMouseDown = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      dispatch(focusWindow(windowState.id));
      resizeRef.current = { edge, startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y, initW: size.w, initH: size.h };
      setActiveResizeEdge(edge);
      setIsResizing(true);
    },
    [dispatch, windowState.id, pos, size]
  );

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const r = resizeRef.current; if (!r) return;
      const dx = e.clientX - r.startX, dy = e.clientY - r.startY;
      let nx = r.initX, ny = r.initY, nw = r.initW, nh = r.initH;
      if (r.edge.includes('e')) nw = Math.max(MIN_W, r.initW + dx);
      if (r.edge.includes('w')) { nw = Math.max(MIN_W, r.initW - dx); nx = r.initX + (r.initW - nw); }
      if (r.edge.includes('s')) nh = Math.max(MIN_H, r.initH + dy);
      if (r.edge.includes('n')) { nh = Math.max(MIN_H, r.initH - dy); ny = Math.max(0, r.initY + (r.initH - nh)); }
      setPos({ x: nx, y: ny }); setSize({ w: nw, h: nh });
    };
    const onUp = () => {
      setIsResizing(false);
      setActiveResizeEdge(null);
      setPos((p) => { setSize((s) => { dispatch(updateGeometry({ id: windowState.id, geometry: { x: p.x, y: p.y, width: s.w, height: s.h } })); return s; }); return p; });
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizing, dispatch, windowState.id]);

  // ── Snap overlay geometry ─────────────────────────────────────────────────
  const snapGeo = snapZone ? snapGeometry(snapZone) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  if (!windowState.isOpen || windowState.isMinimized) return null;

  const isMax = windowState.isMaximized;
  const H = 6; // resize hit-area

  const containerStyle: React.CSSProperties = isMax
    ? { zIndex: windowState.zIndex }
    : { zIndex: windowState.zIndex, top: pos.y, left: pos.x, width: size.w, height: size.h };

  const containerClass = isMax
    ? `fixed top-8 left-0 right-0 bottom-0 z-[9500] flex flex-col shadow-2xl overflow-hidden ${
        themeStyle !== 'default' ? 'theme-window-container border-none rounded-none' : 'bg-[#1e1e1e] border-none rounded-none'
      }`
    : `absolute flex flex-col overflow-hidden ${
        themeStyle !== 'default'
          ? 'theme-window-container'
          : 'bg-[#1e1e1e] border border-white/20 border-t-white/30 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
      }`;

  const edgeStyle = (edge: ResizeEdge): React.CSSProperties => {
    const base: React.CSSProperties = { position: 'absolute', zIndex: 100, cursor: EDGE_CURSOR[edge], userSelect: 'none' };
    if (edge === 'nw') return { ...base, top: 0, left: 0, width: H * 2, height: H * 2 };
    if (edge === 'ne') return { ...base, top: 0, right: 0, width: H * 2, height: H * 2 };
    if (edge === 'sw') return { ...base, bottom: 0, left: 0, width: H * 2, height: H * 2 };
    if (edge === 'se') return { ...base, bottom: 0, right: 0, width: H * 2, height: H * 2 };
    if (edge === 'n')  return { ...base, top: 0, left: H * 2, right: H * 2, height: H };
    if (edge === 's')  return { ...base, bottom: 0, left: H * 2, right: H * 2, height: H };
    if (edge === 'w')  return { ...base, left: 0, top: H * 2, bottom: H * 2, width: H };
    return               { ...base, right: 0, top: H * 2, bottom: H * 2, width: H };
  };

  const edges: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <>
      {/* Snap preview overlay */}
      {isDragging && snapGeo && (
        <div
          className={SNAP_OVERLAY_CLASS}
          style={{ top: snapGeo.y, left: snapGeo.x, width: snapGeo.w, height: snapGeo.h }}
        />
      )}
      {/* Snap zone label */}
      {isDragging && snapZone && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[99999] px-3 py-1 bg-indigo-600/80 backdrop-blur text-white text-xs rounded-full border border-indigo-400/50 pointer-events-none">
          {snapZone === 'top' ? 'Maximize' : `Snap ${snapZone.replace('-', ' ')}`}
        </div>
      )}

      <div
        className={containerClass}
        style={containerStyle}
        onMouseDown={() => dispatch(focusWindow(windowState.id))}
      >
        {/* Resize handles */}
        {!isMax && edges.map((edge) => (
          <div key={edge} style={edgeStyle(edge)} onMouseDown={handleResizeMouseDown(edge)} />
        ))}

        {/* Title bar */}
        <div
          className={`flex items-center justify-between px-4 py-2 select-none shrink-0 border-b ${
            themeStyle !== 'default' ? 'theme-window-titlebar' : 'bg-[#2d2d2d] border-b-black/50 border-t-white/10 text-gray-200'
          } ${isMax ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={() => {
            sound.playWindowSnap();
            dispatch(toggleMaximize(windowState.id));
          }}
        >
          <span className="text-sm font-semibold pointer-events-none tracking-wide">{windowState.title}</span>
          <div className="flex items-center gap-2">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                sound.playWindowMinimize();
                dispatch(toggleMinimize(windowState.id));
              }}
              className="p-1 rounded hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              title="Minimize"
            >
              <Minus size={16} />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                sound.playWindowSnap();
                dispatch(toggleMaximize(windowState.id));
              }}
              className="p-1 rounded hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              title={isMax ? 'Restore' : 'Maximize'}
            >
              {isMax ? <Copy size={14} /> : <Square size={14} />}
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                sound.playWindowClose();
                dispatch(closeWindow(windowState.id));
              }}
              className="p-1 rounded hover:bg-red-500/20 hover:text-red-300 active:scale-90 transition-all cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden theme-app-body">{children}</div>

        {/* Event capture overlay during drag/resize */}
        {(isDragging || isResizing) && (
          <div className="absolute inset-0 z-50 bg-transparent" style={{ cursor: isResizing && activeResizeEdge ? EDGE_CURSOR[activeResizeEdge] : 'move' }} />
        )}
      </div>
    </>
  );
};