import { useEffect, useRef, useState } from 'react';
import { PhysicsEngine, Ball, Pocket } from '../utils/physicsEngine';
import planck from 'planck-js';
import { soundManager } from '../utils/soundManager';

const SCALE = 100; // pixels per meter for Planck.js (must match physicsEngine.ts)

interface PoolTableProps {
  balls: Ball[];
  onBallsUpdate: (balls: Ball[]) => void;
  onTurnComplete: () => void;
  canShoot: boolean;
  currentPlayer: 'designer' | 'client';
  opponentRole?: 'designer' | 'client' | null;
  isPracticeMode?: boolean;
  onShotStart?: (ballsBeforeShot: Ball[]) => void;
  onCueBallFoul?: (wasSunk: boolean) => void;
}

export function PoolTable({ balls, onBallsUpdate, onTurnComplete, canShoot, currentPlayer, opponentRole, isPracticeMode, onShotStart, onCueBallFoul }: PoolTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const animationRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const turnCompletedRef = useRef<boolean>(false);
  const shotInProgressRef = useRef<boolean>(false);
  const lastUpdateRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const previousBallsRef = useRef<Ball[]>([]);
  const sinkingBallsRef = useRef<Map<string, { startTime: number; x: number; y: number }>>(new Map());
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
  const shotStartedRef = useRef<boolean>(false);
  
  const tableWidth = 900;
  const tableHeight = 500;
  
  // Initialize physics engine once
  useEffect(() => {
    if (!engineRef.current) {
      console.log('🎱 Initializing physics engine...');
      engineRef.current = new PhysicsEngine(tableWidth, tableHeight);
      
      // Add all balls to the engine on initial creation
      balls.forEach(ball => {
        if (!ball.sunk) {
          console.log(`Adding ball ${ball.id} at (${ball.x}, ${ball.y})`);
          engineRef.current?.addBall({ ...ball });
        }
      });
    }
  }, []); // Only run once on mount
  
  // Sync balls when they change (from multiplayer, undo, etc.)
  useEffect(() => {
    if (!engineRef.current) return;
    
    // Find the cue ball in both old and new state
    const cueBall = balls.find(b => b.type === 'cue');
    const engineCueBall = engineRef.current.getAllBalls().find(b => b.type === 'cue');
    
    // Check if cue ball was respawned (moved from off-screen to spawn position)
    const RESPAWN_X = 225; // tableWidth (900) * 0.25
    const RESPAWN_Y = 250; // tableHeight (500) * 0.5
    const isCueBallRespawn = cueBall && engineCueBall &&
                             Math.abs(cueBall.x - RESPAWN_X) < 10 &&
                             Math.abs(cueBall.y - RESPAWN_Y) < 10 &&
                             (engineCueBall.x < -500 || Math.abs(engineCueBall.x - RESPAWN_X) > 50);
    
    // Don't sync if we're the active player or if a shot is in progress
    // UNLESS it's a cue ball respawn (which needs to sync to both players)
    if (!isCueBallRespawn && (canShoot || shotInProgressRef.current)) {
      console.log('⏭️ Skipping ball sync - local player is active');
      return;
    }
    
    if (isCueBallRespawn) {
      console.log('🔄 Syncing CUE BALL RESPAWN from remote update');
    } else {
      console.log('🔄 Syncing balls from remote update');
    }
    
    const engine = engineRef.current;
    
    balls.forEach(ball => {
      const existingBall = engine.getAllBalls().find(b => b.id === ball.id);
      
      if (ball.sunk && existingBall) {
        // Mark ball as sunk but keep it in the array for progress tracking
        existingBall.sunk = true;
        if (existingBall.body) {
          console.log(`Removing physics body for sunk ball ${ball.id}`);
          engine.world.destroyBody(existingBall.body);
          existingBall.body = undefined;
        }
      } else if (!ball.sunk && existingBall && existingBall.sunk) {
        // Ball was unsunk (e.g., from undo) - recreate it
        console.log(`Recreating ball ${ball.id}`);
        existingBall.sunk = false;
        existingBall.x = ball.x;
        existingBall.y = ball.y;
        existingBall.vx = ball.vx || 0;
        existingBall.vy = ball.vy || 0;
        
        // Recreate physics body
        const body = engine.world.createBody({
          type: 'dynamic',
          position: planck.Vec2(ball.x / SCALE, ball.y / SCALE),
          linearDamping: 1.2,
          angularDamping: 0.8,
          bullet: true,
          allowSleep: true
        });
        
        body.createFixture({
          shape: planck.Circle(ball.radius / SCALE),
          density: 2.7,
          friction: 0.35,
          restitution: 0.92
        });
        
        body.setUserData(existingBall);
        existingBall.body = body;
      } else if (existingBall) {
        // Update position if changed significantly (from remote update)
        const dx = Math.abs(existingBall.x - ball.x);
        const dy = Math.abs(existingBall.y - ball.y);
        if (dx > 1 || dy > 1) {
          console.log(`📍 Updating ball ${ball.id} position from (${existingBall.x.toFixed(0)}, ${existingBall.y.toFixed(0)}) to (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`);
          existingBall.x = ball.x;
          existingBall.y = ball.y;
          if (existingBall.body) {
            existingBall.body.setPosition(planck.Vec2(ball.x / SCALE, ball.y / SCALE));
            existingBall.body.setLinearVelocity(planck.Vec2(ball.vx || 0, ball.vy || 0));
          }
        }
      }
    });
  }, [balls, canShoot]);
  
  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let frameCount = 0;
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      
      if (engineRef.current) {
        // Step physics with capped delta time
        engineRef.current.step(Math.min(deltaTime, 1 / 30));
        
        const isCurrentlyMoving = engineRef.current.isMoving();
        const updatedBalls = engineRef.current.getSerializableBalls();
        
        // Always update parent state to capture sunk balls immediately
        // This ensures progress tracking updates in real-time
        onBallsUpdate(updatedBalls);
        lastUpdateRef.current = now;
        
        // Track shot state
        if (isCurrentlyMoving && !shotInProgressRef.current) {
          console.log('🎯 Shot started!');
          shotInProgressRef.current = true;
          turnCompletedRef.current = false;
          
          // Call onShotStart if provided
          if (onShotStart) {
            onShotStart(updatedBalls);
          }
        }
        
        // Check if shot completed
        if (!isCurrentlyMoving && shotInProgressRef.current && !turnCompletedRef.current) {
          console.log('⏸️ Balls stopped, completing turn...');
          shotInProgressRef.current = false;
          turnCompletedRef.current = true;
          
          // Small delay to ensure physics fully settled
          setTimeout(() => {
            if (!engineRef.current?.isMoving()) {
              console.log('✅ Turn completed');
              onTurnComplete();
            }
          }, 150);
        }
        
        // Log debug info every 60 frames
        if (frameCount % 60 === 0 && isCurrentlyMoving) {
          console.log(`Moving: ${isCurrentlyMoving}, Shot in progress: ${shotInProgressRef.current}`);
        }
        frameCount++;
      }
      
      // Render directly here with access to current state
      renderTable(ctx);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, dragStart, dragEnd, canShoot, currentPlayer]); // Add dependencies so render has access to current state
  
  const renderTable = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, tableWidth, tableHeight);
    
    // Draw table felt
    ctx.fillStyle = '#1a472a';
    ctx.fillRect(10, 10, tableWidth - 20, tableHeight - 20);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(tableWidth / 2, 10);
    ctx.lineTo(tableWidth / 2, tableHeight - 10);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw pockets
    if (engineRef.current) {
      engineRef.current.pockets.forEach((pocket: Pocket) => {
        // Pocket hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pocket highlight
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Pocket inner shadow
        const gradient = ctx.createRadialGradient(pocket.x, pocket.y, 0, pocket.x, pocket.y, pocket.radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    }
    
    // Draw balls from physics engine (not from props!)
    const currentBalls = engineRef.current?.getAllBalls() || balls;
    
    // Debug: Log cue ball status every 60 frames
    const frameCount = frameCountRef.current++;
    if (frameCount % 60 === 0) {
      const cueBall = currentBalls.find(b => b.type === 'cue');
      if (cueBall) {
        console.log(`⚪ Cue ball status: x=${cueBall.x.toFixed(0)}, y=${cueBall.y.toFixed(0)}, sunk=${cueBall.sunk}, hasBody=${!!cueBall.body}`);
      } else {
        console.log('❌ No cue ball found in currentBalls!');
      }
    }
    
    currentBalls.forEach((ball) => {
      if (ball.sunk) {
        if (ball.type === 'cue') {
          console.log(`⚠️ Skipping render for CUE BALL because sunk=${ball.sunk}`);
        }
        return;
      }
      
      if (ball.type === 'cue' && frameCount % 60 === 0) {
        console.log(`✅ Rendering cue ball at (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`);
      }
      
      // Ball shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x + 3, ball.y + 3, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball body with gradient
      const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3,
        ball.y - ball.radius * 0.3,
        ball.radius * 0.1,
        ball.x,
        ball.y,
        ball.radius
      );
      gradient.addColorStop(0, lightenColor(ball.color, 40));
      gradient.addColorStop(1, ball.color);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball outline
      ctx.strokeStyle = darkenColor(ball.color, 20);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Ball highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball number
      if (ball.type !== 'cue') {
        ctx.fillStyle = ball.type === 'eight' ? '#ffffff' : '#000000';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (ball.type === 'eight') {
          ctx.fillText('8', ball.x, ball.y);
        } else {
          ctx.fillText(ball.number.toString(), ball.x, ball.y);
        }
      }
    });
    
    // Draw aiming guide - use currentBalls instead of props
    if (isDragging && dragStart && dragEnd && canShoot) {
      console.log(`🎨 Rendering aiming guide: isDragging=${isDragging}, dragStart=${JSON.stringify(dragStart)}, dragEnd=${JSON.stringify(dragEnd)}, canShoot=${canShoot}`);
      const cueBall = currentBalls.find(b => b.type === 'cue' && !b.sunk);
      if (cueBall) {
        console.log(`⚪ Cue ball found at (${cueBall.x.toFixed(0)}, ${cueBall.y.toFixed(0)})`);
        const dx = dragStart.x - dragEnd.x;
        const dy = dragStart.y - dragEnd.y;
        const dragDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (dragDistance > 5) {
          const angle = Math.atan2(dy, dx);
          const power = Math.min(dragDistance / 10, 10);
          const powerPercent = (power / 10) * 100;
          
          // Find which ball we'll hit first
          const trajectoryLength = 800; // Extended for better prediction
          const targetBall = findFirstBallInPath(
            cueBall,
            angle,
            trajectoryLength,
            currentBalls
          );
          
          // Draw trajectory line
          const lineLength = targetBall ? targetBall.distance : trajectoryLength;
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.7, powerPercent / 150)})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([15, 15]);
          ctx.beginPath();
          ctx.moveTo(cueBall.x, cueBall.y);
          
          const endX = cueBall.x + Math.cos(angle) * lineLength;
          const endY = cueBall.y + Math.sin(angle) * lineLength;
          
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Highlight target ball
          if (targetBall) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(targetBall.ball.x, targetBall.ball.y, targetBall.ball.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw impact point
            ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(endX, endY, 6, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Draw power indicator line
          ctx.strokeStyle = currentPlayer === 'designer' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(dragStart.x, dragStart.y);
          ctx.lineTo(dragEnd.x, dragEnd.y);
          ctx.stroke();
          
          // Draw power circle
          ctx.fillStyle = currentPlayer === 'designer' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)';
          ctx.beginPath();
          ctx.arc(dragEnd.x, dragEnd.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw power percentage
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(powerPercent)}%`, dragEnd.x, dragEnd.y - 25);
        }
      }
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canShoot || shotInProgressRef.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cueBall = balls.find(b => b.type === 'cue' && !b.sunk);
    if (cueBall) {
      const dx = x - cueBall.x;
      const dy = y - cueBall.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      console.log(`🖱️ Mouse down at (${x.toFixed(0)}, ${y.toFixed(0)}), cue ball at (${cueBall.x.toFixed(0)}, ${cueBall.y.toFixed(0)}), distance: ${distance.toFixed(0)}`);
      
      if (distance < cueBall.radius + 50) {
        console.log('✅ Starting drag from cue ball');
        setIsDragging(true);
        setDragStart({ x, y });
        setDragEnd({ x, y });
      } else {
        console.log('❌ Click too far from cue ball');
      }
    } else {
      console.log('❌ No cue ball found');
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragEnd({ x, y });
  };
  
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;
    
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    console.log(`🎯 Mouse up: distance=${distance.toFixed(2)}, dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}`);
    
    if (distance > 10 && engineRef.current) {
      // Reduced multiplier for more realistic force
      // Lower values = softer shots, more control
      const multiplier = 0.15; // Reduced from 0.5 for more realistic gameplay
      const impulseX = dx * multiplier;
      const impulseY = dy * multiplier;
      
      console.log(`💥 Applying impulse: (${impulseX.toFixed(4)}, ${impulseY.toFixed(4)})`);
      
      engineRef.current.applyImpulse('cue', impulseX, impulseY);
      
      // Play cue hit sound based on power
      const power = Math.min(distance / 200, 1);
      soundManager.playCueHit(power);
      
      // Reset turn completion flag for new shot
      turnCompletedRef.current = false;
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canShoot || shotInProgressRef.current) return;
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const cueBall = balls.find(b => b.type === 'cue' && !b.sunk);
    if (cueBall) {
      const dx = x - cueBall.x;
      const dy = y - cueBall.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < cueBall.radius + 50) {
        setIsDragging(true);
        setDragStart({ x, y });
        setDragEnd({ x, y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setDragEnd({ x, y });
  };

  const handleTouchEnd = () => {
    if (!isDragging || !dragStart || !dragEnd) return;
    
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 10 && engineRef.current) {
      const multiplier = 0.15;
      const impulseX = dx * multiplier;
      const impulseY = dy * multiplier;
      
      engineRef.current.applyImpulse('cue', impulseX, impulseY);
      
      // Play cue hit sound based on power
      const power = Math.min(distance / 200, 1);
      soundManager.playCueHit(power);
      
      turnCompletedRef.current = false;
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };
  
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        width={tableWidth}
        height={tableHeight}
        className="border-4 border-[#2d2d2d] rounded-lg shadow-2xl cursor-crosshair touch-none max-w-full max-h-full object-contain"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      {!canShoot && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg pointer-events-none">
          <div className="bg-black/80 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base">
            {isPracticeMode ? (
              `Waiting for ${currentPlayer === 'designer' ? 'Designer' : 'Client'}...`
            ) : opponentRole ? (
              `${opponentRole === 'designer' ? '🎨 Designer' : '💬 Client'}'s turn...`
            ) : (
              'Waiting for opponent to join...'
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)
  ).toString(16).slice(1);
}

// Helper function to find first ball in trajectory path
const findFirstBallInPath = (
  cueBall: Ball,
  angle: number,
  maxDistance: number,
  allBalls: Ball[]
): { ball: Ball; distance: number } | null => {
  let closestBall: Ball | null = null;
  let closestDistance = maxDistance;
  
  // Check each ball (except cue ball)
  allBalls.forEach(ball => {
    if (ball.id === cueBall.id || ball.sunk) return;
    
    // Vector from cue ball to target ball
    const toBallX = ball.x - cueBall.x;
    const toBallY = ball.y - cueBall.y;
    
    // Direction vector
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    
    // Project ball position onto trajectory line
    const projection = toBallX * dirX + toBallY * dirY;
    
    // If ball is behind the shot direction, skip it
    if (projection < 0) return;
    
    // Find closest point on line to ball center
    const closestX = cueBall.x + dirX * projection;
    const closestY = cueBall.y + dirY * projection;
    
    // Distance from ball center to line
    const distToLine = Math.sqrt(
      (ball.x - closestX) ** 2 + (ball.y - closestY) ** 2
    );
    
    // Check if line passes through ball (considering both radii)
    const combinedRadius = cueBall.radius + ball.radius;
    if (distToLine <= combinedRadius && projection < closestDistance) {
      closestBall = ball;
      closestDistance = projection;
    }
  });
  
  return closestBall ? { ball: closestBall, distance: closestDistance } : null;
};