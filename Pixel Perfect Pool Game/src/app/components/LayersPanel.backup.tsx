import { Ball } from '../utils/physicsEngine';
import { Layers, Circle } from 'lucide-react';

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
  
  return (
    <div className="w-64 h-full bg-[#2c2c2c] border-r border-[#1e1e1e] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5" />
          <h2 className="font-semibold text-sm">Layers</h2>
        </div>
      </div>
      
      {/* Current Turn */}
      <div className="p-4 border-b border-[#1e1e1e]">
        <div className="text-xs text-gray-400 mb-2">Current Turn</div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentPlayer === 'designer' ? 'bg-blue-500' : 'bg-red-500'}`} />
          <span className="text-white text-sm font-medium">
            {currentPlayer === 'designer' ? 'The Designer' : 'The Client'}
          </span>
        </div>
      </div>
      
      {/* Score */}
      <div className="p-4 border-b border-[#1e1e1e]">
        <div className="text-xs text-gray-400 mb-3">Progress</div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-400 text-xs font-medium">Designer (Assets)</span>
              <span 
                key={`designer-${designerBallsSunk}`}
                className="text-white text-xs font-bold px-2 py-0.5 bg-blue-500/20 rounded animate-pulse"
              >
                {designerBallsSunk}/7
              </span>
            </div>
            <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out shadow-lg"
                style={{ 
                  width: `${(designerBallsSunk / 7) * 100}%`,
                  boxShadow: designerBallsSunk > 0 ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none'
                }}
              />
            </div>
            {designerBallsSunk === 7 && (
              <div className="text-[10px] text-blue-400 mt-1 font-semibold">✓ All assets cleared!</div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-red-400 text-xs font-medium">Client (Feedback)</span>
              <span 
                key={`client-${clientBallsSunk}`}
                className="text-white text-xs font-bold px-2 py-0.5 bg-red-500/20 rounded animate-pulse"
              >
                {clientBallsSunk}/7
              </span>
            </div>
            <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out shadow-lg"
                style={{ 
                  width: `${(clientBallsSunk / 7) * 100}%`,
                  boxShadow: clientBallsSunk > 0 ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
                }}
              />
            </div>
            {clientBallsSunk === 7 && (
              <div className="text-[10px] text-red-400 mt-1 font-semibold">✓ All feedback cleared!</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Balls List */}
      <div className="flex-1 overflow-y-auto">
        {/* Cue Ball */}
        <div className="p-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <Circle 
              className="w-4 h-4" 
              style={{ color: cueBall?.color }}
              fill={cueBall?.color}
            />
            <span className="text-white text-xs">System Cursor (Cue Ball)</span>
          </div>
        </div>
        
        {/* Designer Balls */}
        <div className="p-3 border-b border-[#1e1e1e]">
          <div className="text-xs text-blue-400 mb-2 font-medium">Project Assets</div>
          <div className="space-y-1">
            {designerBalls.map(ball => (
              <div key={ball.id} className="flex items-center gap-2 pl-2">
                <Circle 
                  className="w-3 h-3" 
                  style={{ color: ball.color, opacity: ball.sunk ? 0.3 : 1 }}
                  fill={ball.color}
                />
                <span className={`text-xs ${ball.sunk ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                  Asset_{ball.number}.figma
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Client Balls */}
        <div className="p-3 border-b border-[#1e1e1e]">
          <div className="text-xs text-red-400 mb-2 font-medium">Feedback Notes</div>
          <div className="space-y-1">
            {clientBalls.map(ball => (
              <div key={ball.id} className="flex items-center gap-2 pl-2">
                <Circle 
                  className="w-3 h-3" 
                  style={{ color: ball.color, opacity: ball.sunk ? 0.3 : 1 }}
                  fill={ball.color}
                />
                <span className={`text-xs ${ball.sunk ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                  Note_{ball.number}.comment
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Eight Ball */}
        <div className="p-3 border-b border-[#1e1e1e]">
          <div className="text-xs text-purple-400 mb-2 font-medium">Final Deliverable</div>
          <div className="flex items-center gap-2 pl-2">
            <Circle 
              className="w-3 h-3" 
              style={{ color: eightBall?.color, opacity: eightBall?.sunk ? 0.3 : 1 }}
              fill={eightBall?.color}
            />
            <span className={`text-xs ${eightBall?.sunk ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
              Final_Final_v2.fig
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-[#1e1e1e] text-center">
        <div className="text-[10px] text-gray-500">
          Pixel Pool • Figma Hackathon
        </div>
      </div>
    </div>
  );
}