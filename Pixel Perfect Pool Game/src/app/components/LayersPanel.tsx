import { Ball } from '../utils/physicsEngine';
import { Layers } from 'lucide-react';

interface LayersPanelProps {
  balls: Ball[];
  currentPlayer: 'designer' | 'client';
  designerBallsSunk: number;
  clientBallsSunk: number;
}

export function LayersPanel({ balls, currentPlayer, designerBallsSunk, clientBallsSunk }: LayersPanelProps) {
  const designerBalls = balls.filter(b => b.type === 'designer');
  const clientBalls = balls.filter(b => b.type === 'client');
  const eightBall = balls.find(b => b.type === 'eight');
  const cueBall = balls.find(b => b.type === 'cue');
  
  const playerRole = currentPlayer === 'designer' ? 'Designer' : 'Client';
  
  // Creative layer names
  const designerLayerNames = ['Logo.fig', 'Components', 'Wireframe', 'Assets', 'Mockup', 'Typography', 'Color_Palette'];
  const clientLayerNames = ['Feedback_1', 'Revisions', 'Comments', 'Notes', 'Changes_v2', 'More_Feedback', 'Scope_Creep'];
  
  return (
    <div className="w-[244px] h-full bg-[#2c2c2c] border-r border-[#3c3c3c] flex flex-col">
      {/* Header */}
      <div className="relative shrink-0 w-full border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2 p-4">
          <Layers className="w-5 h-5 text-[#adadad]" strokeWidth={1.67} />
          <h2 className="text-white text-sm font-semibold tracking-tight">Layers</h2>
        </div>
      </div>
      
      {/* Your Role Section - Fixed to prevent glitches */}
      <div className="relative shrink-0 w-full border-b border-[#3c3c3c]">
        <div className="flex flex-col items-start p-4">
          <div className={`w-full rounded border transition-colors duration-150 ${
            currentPlayer === 'designer' 
              ? 'bg-[rgba(13,153,255,0.2)] border-[#0d99ff]' 
              : 'bg-[rgba(239,68,68,0.2)] border-[#ef4444]'
          }`} style={{ willChange: 'background-color, border-color' }}>
            <div className="flex flex-col gap-1 px-[13px] py-[9px]">
              <p className={`text-xs font-semibold transition-colors duration-150 ${
                currentPlayer === 'designer' ? 'text-[#0d99ff]' : 'text-[#ef4444]'
              }`}>
                YOUR ROLE
              </p>
              <p className="text-white text-sm capitalize tracking-tight">
                {playerRole}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Layers Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-4">
          <p className="text-[#adadad] text-xs font-semibold mb-3 pl-2">ACTIVE LAYERS</p>
          
          <div className="space-y-0">
            {/* Cue Ball */}
            <div className={`h-7 rounded flex items-center px-2 gap-2 transition-colors duration-150 ${
              cueBall && !cueBall.sunk ? 'bg-[rgba(13,153,255,0.2)]' : ''
            }`}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ 
                backgroundColor: cueBall?.color,
                border: `1.33px solid ${cueBall?.color}`
              }} />
              <span className="text-white text-xs flex-1 truncate">System Cursor</span>
            </div>
            
            {/* Designer Balls */}
            {designerBalls.map((ball, index) => (
              <div 
                key={ball.id} 
                className={`h-7 rounded flex items-center px-2 gap-2 transition-opacity duration-150 ${
                  ball.sunk ? 'opacity-40' : ''
                }`}
              >
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ 
                  backgroundColor: ball.color,
                  border: `1.33px solid ${ball.color}`
                }} />
                <span className={`text-white text-xs flex-1 truncate ${ball.sunk ? 'line-through' : ''}`}>
                  {designerLayerNames[index]}
                </span>
                {ball.sunk && (
                  <span className="text-[#adadad] text-xs">✓</span>
                )}
              </div>
            ))}
            
            {/* Client Balls */}
            {clientBalls.map((ball, index) => (
              <div 
                key={ball.id} 
                className={`h-7 rounded flex items-center px-2 gap-2 transition-opacity duration-150 ${
                  ball.sunk ? 'opacity-40' : ''
                }`}
              >
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ 
                  backgroundColor: ball.color,
                  border: `1.33px solid ${ball.color}`
                }} />
                <span className={`text-white text-xs flex-1 truncate ${ball.sunk ? 'line-through' : ''}`}>
                  {clientLayerNames[index]}
                </span>
                {ball.sunk && (
                  <span className="text-[#adadad] text-xs">✓</span>
                )}
              </div>
            ))}
            
            {/* Eight Ball - Final_Final_v2 */}
            <div 
              className={`h-7 rounded flex items-center px-2 gap-2 transition-all duration-150 ${
                eightBall?.sunk 
                  ? 'opacity-40' 
                  : (designerBallsSunk === 7 || clientBallsSunk === 7) 
                    ? 'bg-[rgba(240,177,0,0.2)]' 
                    : ''
              }`}
            >
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ 
                backgroundColor: eightBall?.color,
                border: `1.33px solid ${eightBall?.color}`
              }} />
              <span className={`text-white text-xs flex-1 truncate ${eightBall?.sunk ? 'line-through' : ''}`}>
                Final_Final_v2
              </span>
              {!eightBall?.sunk && (designerBallsSunk === 7 || clientBallsSunk === 7) && (
                <span className="text-[#f0b100] text-xs font-bold">⚠️</span>
              )}
              {eightBall?.sunk && (
                <span className="text-[#adadad] text-xs">✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-[#3c3c3c] text-center">
        <div className="text-[10px] text-[#6b6b6b]">
          Pixel Pool
        </div>
      </div>
    </div>
  );
}