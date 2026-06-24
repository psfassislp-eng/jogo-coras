/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GameNode, GameEdge, ThemeConfig, RopeConfig, ParticleConfig } from '../types';
import { distance } from '../engine/geometry';
import { playSound } from '../audio/soundEffects';

interface GameBoardProps {
  nodes: GameNode[];
  edges: GameEdge[];
  theme: ThemeConfig;
  ropeConfig: RopeConfig;
  effectConfig: ParticleConfig;
  hintedNodeId?: string;
  hintedEdgeId?: string;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeRelease: (nodeId: string, endX: number, endY: number) => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  shape: 'circle' | 'sparkle' | 'star';
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
}

export default function GameBoard({
  nodes,
  edges,
  theme,
  ropeConfig,
  effectConfig,
  hintedNodeId,
  hintedEdgeId,
  onNodeMove,
  onNodeRelease,
}: GameBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Sound and Haptic states
  const prevCrossingsRef = useRef<number>(0);

  // Track coordinates for dragging
  const handleDragStart = (nodeId: string, clientX: number, clientY: number) => {
    playSound('drag');
    setDraggedNodeId(nodeId);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!draggedNodeId || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    // Convert client coordinates to 600x600 SVG coordinate space
    const x = ((clientX - rect.left) / rect.width) * 600;
    const y = ((clientY - rect.top) / rect.height) * 600;

    // Boundary clamping (keep nodes inside 600x600 arena with padding)
    const padding = 35;
    const clampedX = Math.max(padding, Math.min(600 - padding, x));
    const clampedY = Math.max(padding, Math.min(600 - padding, y));

    onNodeMove(draggedNodeId, clampedX, clampedY);
  };

  const handleDragEnd = () => {
    if (!draggedNodeId) return;
    
    // Find the node that was dropped
    const nodeObj = nodes.find((n) => n.id === draggedNodeId);
    if (nodeObj) {
      onNodeRelease(draggedNodeId, nodeObj.x, nodeObj.y);
      
      // Trigger particles/ripples at the dropped node location if unlocked
      if (effectConfig.id !== 'none') {
        triggerEffect(nodeObj.x, nodeObj.y);
      }
    }
    
    setDraggedNodeId(null);
    playSound('click');
  };

  // Setup Global mouse/touch move event listeners for solid, lag-free dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNodeId) {
        handleDragMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggedNodeId && e.touches.length > 0) {
        // Prevent scroll when dragging nodes on mobile devices
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      if (draggedNodeId) {
        handleDragEnd();
      }
    };

    if (draggedNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggedNodeId, nodes]);

  // Particle and Ripple Animation Loop
  useEffect(() => {
    const updatePhysics = () => {
      // Update Particles
      setParticles((prevParticles) =>
        prevParticles
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // subtle gravity
            opacity: p.opacity - 0.02,
          }))
          .filter((p) => p.opacity > 0)
      );

      // Update Ripples
      setRipples((prevRipples) =>
        prevRipples
          .map((r) => ({
            ...r,
            radius: r.radius + 3,
            opacity: Math.max(0, 1 - r.radius / r.maxRadius),
          }))
          .filter((r) => r.opacity > 0)
      );

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Creates sparkles, ripple, or starry confetti at coordinates
  const triggerEffect = (x: number, y: number) => {
    const color = effectConfig.color === '#38bdf8' ? theme.primary : effectConfig.color === '#ec4899' ? theme.accent : theme.edgeSolved;

    if (effectConfig.id === 'particles' || effectConfig.id === 'confetti') {
      const count = effectConfig.count;
      const newParticles: Particle[] = [];
      const shape = effectConfig.shape;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        newParticles.push({
          id: `particle_${Date.now()}_${i}_${Math.random()}`,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (effectConfig.id === 'confetti' ? 2 : 0), // Confetti bursts upwards
          color: effectConfig.id === 'confetti' ? getRandomConfettiColor() : color,
          size: effectConfig.id === 'confetti' ? 4 + Math.random() * 8 : 3 + Math.random() * 5,
          opacity: 1,
          shape,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    } else if (effectConfig.id === 'ripple') {
      const newRipple: Ripple = {
        id: `ripple_${Date.now()}_${Math.random()}`,
        x,
        y,
        radius: 5,
        maxRadius: 110,
        color,
        opacity: 1,
      };
      setRipples((prev) => [...prev, newRipple]);
    }
  };

  const getRandomConfettiColor = () => {
    const colors = ['#f43f5e', '#06b6d4', '#eab308', '#a855f7', '#10b981', '#fb923c'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Render nodes and edges
  const getEdgeStyle = (edge: GameEdge) => {
    const color = edge.isIntersecting ? theme.edgeNormal : theme.edgeSolved;
    const isHinted = hintedEdgeId === edge.id;

    return {
      stroke: isHinted ? theme.accent : color,
      strokeWidth: edge.isIntersecting 
        ? (isHinted ? ropeConfig.strokeWidth + 3.5 : ropeConfig.strokeWidth + 1.5) 
        : (isHinted ? ropeConfig.strokeWidth + 2 : ropeConfig.strokeWidth),
      strokeDasharray: edge.isIntersecting ? '8,4' : (ropeConfig.dashArray || undefined),
      filter: ropeConfig.glowClass ? (edge.isIntersecting ? 'url(#glow-red)' : 'url(#glow-green)') : 'url(#glow-green)',
      transition: 'stroke 0.25s ease, stroke-width 0.15s ease',
    };
  };

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto select-none rounded-3xl overflow-hidden shadow-2xl p-2 bg-black/10 border border-white/5">
      {/* Dynamic SVG Arena */}
      <svg
        id="game-board-svg"
        ref={svgRef}
        viewBox="0 0 600 600"
        className="w-full h-full select-none overflow-visible"
        style={{ touchAction: 'none' }}
      >
        {/* Glow Filters for ropes */}
        <defs>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Node shadow */}
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* --- 1. RIPPLES --- */}
        {ripples.map((ripple) => (
          <circle
            key={ripple.id}
            cx={ripple.x}
            cy={ripple.y}
            r={ripple.radius}
            fill="none"
            stroke={ripple.color}
            strokeWidth="3.5"
            strokeOpacity={ripple.opacity}
          />
        ))}

        {/* --- 2. EDGES (CORDS) --- */}
        {edges.map((edge) => {
          const nodeA = nodes.find((n) => n.id === edge.nodeAId);
          const nodeB = nodes.find((n) => n.id === edge.nodeBId);
          if (!nodeA || !nodeB) return null;

          const isHinted = hintedEdgeId === edge.id;

          return (
            <g key={edge.id}>
              {/* Thick interactive hit target for easy clicking/dragging */}
              <line
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke="transparent"
                strokeWidth="20"
                className="cursor-pointer"
              />

              {/* Rope Backing for Double Line style */}
              {ropeConfig.doubleLine && (
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={theme.background.includes('stone-100') ? '#ffffff' : '#000000'}
                  strokeWidth={ropeConfig.strokeWidth + 2}
                  strokeLinecap="round"
                />
              )}

              {/* Active Rope Line */}
              <line
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                style={getEdgeStyle(edge)}
                strokeLinecap="round"
                className={isHinted ? 'animate-pulse' : ''}
              />
            </g>
          );
        })}

        {/* --- 3. PARTICLES --- */}
        {particles.map((p) => {
          if (p.shape === 'star') {
            return (
              <polygon
                key={p.id}
                points={`${p.x},${p.y - p.size} ${p.x + p.size/3},${p.y - p.size/3} ${p.x + p.size},${p.y} ${p.x + p.size/3},${p.y + p.size/3} ${p.x},${p.y + p.size} ${p.x - p.size/3},${p.y + p.size/3} ${p.x - p.size},${p.y} ${p.x - p.size/3},${p.y - p.size/3}`}
                fill={p.color}
                fillOpacity={p.opacity}
              />
            );
          }
          if (p.shape === 'sparkle') {
            return (
              <g key={p.id} transform={`translate(${p.x},${p.y})`}>
                <line x1={-p.size} y1={0} x2={p.size} y2={0} stroke={p.color} strokeWidth="2" strokeOpacity={p.opacity} />
                <line x1={0} y1={-p.size} x2={0} y2={p.size} stroke={p.color} strokeWidth="2" strokeOpacity={p.opacity} />
              </g>
            );
          }
          return (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              fillOpacity={p.opacity}
            />
          );
        })}

        {/* --- 4. NODES --- */}
        {nodes.map((node) => {
          const isDragging = draggedNodeId === node.id;
          const isHinted = hintedNodeId === node.id;

          return (
            <g
              key={node.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDragStart(node.id, e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.touches.length > 0) {
                  handleDragStart(node.id, e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              className="cursor-grab active:cursor-grabbing group select-none"
            >
              {/* Hint pulsating aura */}
              {isHinted && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="3"
                  className="animate-ping opacity-60"
                />
              )}

              {/* Glowing backplate aura when active or hovered */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isDragging ? 26 : 22}
                fill={theme.primary}
                fillOpacity={isDragging ? 0.35 : 0.0}
                className="group-hover:fill-opacity-15 transition-all duration-200"
                style={{
                  filter: isDragging ? `drop-shadow(0 0 10px ${theme.primary})` : 'none',
                }}
              />

              {/* Node Outer Ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isDragging ? 18 : 15}
                fill={theme.nodeFill}
                stroke={isHinted ? theme.accent : isDragging ? theme.primary : theme.nodeStroke}
                strokeWidth={isDragging ? 5 : 3.5}
                filter="url(#shadow)"
                className="transition-all duration-150"
              />

              {/* Node Inner core dot */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isDragging ? 7 : 5.5}
                fill={isHinted ? theme.accent : theme.primary}
                className="transition-all duration-150"
              />

              {/* Number/label helper inside node (subtle design) */}
              {node.label && (
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold select-none fill-neutral-700 pointer-events-none"
                  style={{
                    fill: theme.nodeFill === '#000000' ? '#ffffff' : '#451a03',
                  }}
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
