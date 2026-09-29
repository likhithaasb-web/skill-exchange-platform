import React, { useRef, useState, useEffect } from 'react';
import {
  Pen,
  Pencil,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Triangle,
  Minus,
  MoveRight,
  Type,
  StickyNote,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { WhiteboardElement } from '../../types';
import { useSocket } from '../../context/SocketContext';

interface WhiteboardCanvasProps {
  studioId: string;
  initialElements?: WhiteboardElement[];
  onSave?: (elements: WhiteboardElement[]) => void;
  canEdit?: boolean;
}

type ToolType = 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'text' | 'sticky';

const COLORS = [
  '#FFFFFF', // White
  '#D4AF37', // Gold
  '#38BDF8', // Cyan
  '#34D399', // Emerald
  '#F43F5E', // Rose
  '#FBBF24', // Amber
  '#A78BFA', // Purple
  '#1E293B', // Dark slate
];

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  studioId,
  initialElements = [],
  onSave,
  canEdit = true,
}) => {
  const { socket } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#D4AF37');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [elements, setElements] = useState<WhiteboardElement[]>(initialElements);
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [peerCursors, setPeerCursors] = useState<Record<string, { x: number; y: number; username: string }>>({});

  // Socket listener for real-time peer strokes
  useEffect(() => {
    if (!socket) return;

    socket.on('whiteboard-element-received', (element: WhiteboardElement) => {
      setElements((prev) => [...prev, element]);
    });

    socket.on('whiteboard-sync-all', (syncedElements: WhiteboardElement[]) => {
      setElements(syncedElements);
    });

    socket.on('whiteboard-cleared', () => {
      setElements([]);
    });

    socket.on('peer-cursor-moved', ({ socketId, user, cursor }) => {
      setPeerCursors((prev) => ({
        ...prev,
        [socketId]: { x: cursor.x, y: cursor.y, username: user?.username || 'Peer' },
      }));
    });

    return () => {
      socket.off('whiteboard-element-received');
      socket.off('whiteboard-sync-all');
      socket.off('whiteboard-cleared');
      socket.off('peer-cursor-moved');
    };
  }, [socket]);

  // Sync initial elements when changed
  useEffect(() => {
    if (initialElements && initialElements.length > 0) {
      setElements(initialElements);
    }
  }, [initialElements]);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas with dark background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw all confirmed elements
    elements.forEach((el) => drawElement(ctx, el));

    // Draw element currently being drawn
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement, scale]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    const spacing = 25 * scale;
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawElement = (ctx: CanvasRenderingContext2D, el: WhiteboardElement) => {
    ctx.save();
    ctx.strokeStyle = el.color || '#D4AF37';
    ctx.lineWidth = (el.strokeWidth || 3) * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.type === 'pen' || el.type === 'pencil' || el.type === 'highlighter' || el.type === 'eraser') {
      if (el.type === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = (el.strokeWidth || 14) * scale;
      } else if (el.type === 'eraser') {
        ctx.strokeStyle = '#0B0F17';
        ctx.lineWidth = 20 * scale;
      }

      if (el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x * scale, el.points[0].y * scale);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x * scale, el.points[i].y * scale);
        }
        ctx.stroke();
      }
    } else if (el.type === 'line' || el.type === 'arrow') {
      if (el.points && el.points.length >= 2) {
        const from = el.points[0];
        const to = el.points[el.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(from.x * scale, from.y * scale);
        ctx.lineTo(to.x * scale, to.y * scale);
        ctx.stroke();

        if (el.type === 'arrow') {
          // Draw arrow tip
          const angle = Math.atan2((to.y - from.y) * scale, (to.x - from.x) * scale);
          const headlen = 12 * scale;
          ctx.beginPath();
          ctx.moveTo(to.x * scale, to.y * scale);
          ctx.lineTo(to.x * scale - headlen * Math.cos(angle - Math.PI / 6), to.y * scale - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(to.x * scale, to.y * scale);
          ctx.lineTo(to.x * scale - headlen * Math.cos(angle + Math.PI / 6), to.y * scale - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      }
    } else if (el.type === 'rect') {
      if (el.x !== undefined && el.y !== undefined && el.width && el.height) {
        if (el.fill) {
          ctx.fillStyle = el.fill;
          ctx.fillRect(el.x * scale, el.y * scale, el.width * scale, el.height * scale);
        }
        ctx.strokeRect(el.x * scale, el.y * scale, el.width * scale, el.height * scale);
      }
    } else if (el.type === 'circle') {
      if (el.x !== undefined && el.y !== undefined && el.width) {
        const radius = (Math.abs(el.width) / 2) * scale;
        const centerX = (el.x + el.width / 2) * scale;
        const centerY = (el.y + (el.height || el.width) / 2) * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        if (el.fill) {
          ctx.fillStyle = el.fill;
          ctx.fill();
        }
        ctx.stroke();
      }
    } else if (el.type === 'triangle') {
      if (el.x !== undefined && el.y !== undefined && el.width && el.height) {
        ctx.beginPath();
        ctx.moveTo((el.x + el.width / 2) * scale, el.y * scale);
        ctx.lineTo(el.x * scale, (el.y + el.height) * scale);
        ctx.lineTo((el.x + el.width) * scale, (el.y + el.height) * scale);
        ctx.closePath();
        if (el.fill) {
          ctx.fillStyle = el.fill;
          ctx.fill();
        }
        ctx.stroke();
      }
    } else if (el.type === 'text') {
      if (el.x !== undefined && el.y !== undefined && el.text) {
        ctx.fillStyle = el.color || '#FFFFFF';
        ctx.font = `${(el.fontSize || 16) * scale}px 'Inter', sans-serif`;
        ctx.fillText(el.text, el.x * scale, el.y * scale);
      }
    } else if (el.type === 'sticky') {
      if (el.x !== undefined && el.y !== undefined && el.text) {
        const w = (el.width || 140) * scale;
        const h = (el.height || 100) * scale;
        ctx.fillStyle = el.fill || '#FEF08A'; // yellow note
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.fillRect(el.x * scale, el.y * scale, w, h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1C1917';
        ctx.font = `${13 * scale}px 'Inter', sans-serif`;
        ctx.fillText(el.text, (el.x + 8) * scale, (el.y + 20) * scale, w - 16 * scale);
      }
    }

    ctx.restore();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canEdit) return;
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);

    if (tool === 'text') {
      const text = prompt('Enter text for whiteboard:');
      if (text) {
        const textElement: WhiteboardElement = {
          id: 'wb-' + Date.now(),
          type: 'text',
          x,
          y,
          text,
          color,
          fontSize: 18,
        };
        const updated = [...elements, textElement];
        setElements(updated);
        socket?.emit('whiteboard-element-add', { studioId, element: textElement });
        if (onSave) onSave(updated);
      }
      setIsDrawing(false);
      return;
    }

    if (tool === 'sticky') {
      const text = prompt('Enter sticky note text:');
      if (text) {
        const stickyElement: WhiteboardElement = {
          id: 'wb-' + Date.now(),
          type: 'sticky',
          x,
          y,
          width: 150,
          height: 100,
          text,
          fill: color === '#FFFFFF' ? '#FEF08A' : color,
        };
        const updated = [...elements, stickyElement];
        setElements(updated);
        socket?.emit('whiteboard-element-add', { studioId, element: stickyElement });
        if (onSave) onSave(updated);
      }
      setIsDrawing(false);
      return;
    }

    if (tool === 'pen' || tool === 'pencil' || tool === 'highlighter' || tool === 'eraser') {
      setCurrentElement({
        id: 'wb-' + Date.now(),
        type: tool,
        points: [{ x, y }],
        color,
        strokeWidth: tool === 'pencil' ? 1.5 : tool === 'highlighter' ? 16 : strokeWidth,
      });
    } else {
      setCurrentElement({
        id: 'wb-' + Date.now(),
        type: tool,
        x,
        y,
        width: 0,
        height: 0,
        points: [{ x, y }],
        color,
        strokeWidth,
        fill: tool === 'rect' || tool === 'circle' ? 'rgba(212, 175, 55, 0.08)' : undefined,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    // Broadcast cursor to peers
    socket?.emit('cursor-move', { studioId, cursor: { x, y } });

    if (!isDrawing || !currentElement) return;

    if (currentElement.type === 'pen' || currentElement.type === 'pencil' || currentElement.type === 'highlighter' || currentElement.type === 'eraser') {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), { x, y }],
      });
    } else if (currentElement.type === 'line' || currentElement.type === 'arrow') {
      setCurrentElement({
        ...currentElement,
        points: [currentElement.points![0], { x, y }],
      });
    } else if (currentElement.type === 'rect' || currentElement.type === 'circle' || currentElement.type === 'triangle') {
      const startX = currentElement.x || 0;
      const startY = currentElement.y || 0;
      setCurrentElement({
        ...currentElement,
        width: x - startX,
        height: y - startY,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);

    setHistory((prev) => [...prev, elements]);
    setRedoStack([]);

    const updated = [...elements, currentElement];
    setElements(updated);

    // Broadcast element to room
    socket?.emit('whiteboard-element-add', { studioId, element: currentElement });

    if (onSave) onSave(updated);
    setCurrentElement(null);
  };

  const handleUndo = () => {
    if (elements.length === 0) return;
    const previous = elements.slice(0, -1);
    setRedoStack((prev) => [...prev, elements]);
    setElements(previous);
    socket?.emit('whiteboard-update-all', { studioId, elements: previous });
    if (onSave) onSave(previous);
  };

  const handleClear = () => {
    if (window.confirm('Clear the entire collaborative whiteboard?')) {
      setHistory((prev) => [...prev, elements]);
      setElements([]);
      socket?.emit('whiteboard-clear', { studioId });
      if (onSave) onSave([]);
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `SkillX-Studio-Board-${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 rounded-xl overflow-hidden border border-white/10 relative">
      {/* Top Floating Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-obsidian-900/90 border border-white/10 backdrop-blur-md shadow-xl">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {[
            { id: 'pen', icon: Pen, title: 'Pen' },
            { id: 'pencil', icon: Pencil, title: 'Fine Pencil' },
            { id: 'highlighter', icon: Highlighter, title: 'Highlighter' },
            { id: 'eraser', icon: Eraser, title: 'Eraser' },
            { id: 'line', icon: Minus, title: 'Straight Line' },
            { id: 'arrow', icon: MoveRight, title: 'Arrow' },
            { id: 'rect', icon: Square, title: 'Rectangle' },
            { id: 'circle', icon: Circle, title: 'Circle' },
            { id: 'triangle', icon: Triangle, title: 'Triangle' },
            { id: 'text', icon: Type, title: 'Text Note' },
            { id: 'sticky', icon: StickyNote, title: 'Sticky Note' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = tool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTool(item.id as ToolType)}
                disabled={!canEdit}
                className={`p-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-subtle'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } disabled:opacity-40`}
                title={item.title}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Color Palette & Actions */}
        <div className="flex items-center gap-2">
          {/* Colors */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-gold-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Stroke Width Selector */}
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="bg-obsidian-950 border border-white/10 rounded-lg text-xs px-2 py-1 text-slate-300 focus:outline-none"
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={3}>3px</option>
            <option value={6}>6px</option>
          </select>

          {/* Undo / Clear / Export */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={handleUndo}
              disabled={elements.length === 0 || !canEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
              title="Undo Stroke"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              disabled={elements.length === 0 || !canEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30"
              title="Clear Whiteboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPNG}
              className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-gold-500/10"
              title="Export as PNG"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full h-full relative cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1600}
          height={1000}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Live Peer Cursors */}
        {Object.entries(peerCursors).map(([sockId, peer]) => (
          <div
            key={sockId}
            className="absolute pointer-events-none transition-all duration-75 flex items-center gap-1 z-30"
            style={{
              left: `${peer.x * scale}px`,
              top: `${peer.y * scale}px`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-gold-400 ring-2 ring-black" />
            <span className="text-[10px] bg-gold-500 text-obsidian-950 font-bold px-1.5 py-0.5 rounded shadow">
              @{peer.username}
            </span>
          </div>
        ))}

        {!canEdit && (
          <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-amber-400">
            Host has set whiteboard permission to view-only.
          </div>
        )}
      </div>
    </div>
  );
};
