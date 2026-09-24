import { Ball } from '../utils/physicsEngine';
import { Settings, TrendingUp, Target, Circle, AlertCircle } from 'lucide-react';

interface PropertiesPanelProps {
  balls: Ball[];
  currentPlayer: 'designer' | 'client';
  designerBallsSunk: number;
  clientBallsSunk: number;
  turnNumber: number;
  isPracticeMode: boolean;
}

export function PropertiesPanel({ 
  balls, 
  currentPlayer, 
  designerBallsSunk, 
  clientBallsSunk,
  turnNumber,
  isPracticeMode
}: PropertiesPanelProps) {
  const designerBalls = balls.filter(b => b.type === 'designer');
  const clientBalls = balls.filter(b => b.type === 'client');
  const eightBall = balls.find(b => b.type === 'eight');
  const totalProgress = (designerBallsSunk + clientBallsSunk) / 14 * 100;
  
  const designerBallsRemaining = designerBalls.filter(b => !b.sunk).length;
  const clientBallsRemaining = clientBalls.filter(b => !b.sunk).length;
  
  return (
    <div className="w-72 h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 text-gray-900">
          <Settings className="w-5 h-5" />
          <h2 className="font-semibold text-sm">Properties</h2>
        </div>
      </div>
      
      {/* Game Stats - Fixed to prevent glitches */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Game Stats</h3>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Overall Progress</div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900 tabular-nums">{designerBallsSunk + clientBallsSunk}</span>
              <span className="text-sm text-gray-500">of 14 balls</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-[10px] text-blue-600 uppercase font-semibold mb-1">Turn</div>
              <div className="text-2xl font-bold text-blue-900 tabular-nums min-h-[32px] flex items-center">{turnNumber}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-[10px] text-purple-600 uppercase font-semibold mb-1">Mode</div>
              <div className="text-xs font-bold text-purple-900 min-h-[32px] flex items-center">{isPracticeMode ? 'Practice' : 'Multiplayer'}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Stats - Fixed to prevent glitches */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Player Stats</h3>
        </div>
        
        <div className="space-y-3">
          {/* Designer Stats - Consistent border width */}
          <div className={`rounded-lg p-3 border-2 transition-all duration-150 ${
            currentPlayer === 'designer' 
              ? 'bg-blue-50 border-blue-400 shadow-sm' 
              : 'bg-white border-gray-200'
          }`} style={{ willChange: 'background-color, border-color, box-shadow' }}>
            <div className="flex items-center justify-between mb-2 min-h-[20px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-900">Designer</span>
              </div>
              <div className="w-[52px] flex justify-end">
                {currentPlayer === 'designer' && (
                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-blue-600 tabular-nums">{designerBallsSunk}</span>
              <span className="text-xs text-gray-500">/ 7 assets cleared</span>
            </div>
            
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(designerBallsSunk / 7) * 100}%` }}
              />
            </div>
            
            <div className="mt-2 min-h-[14px]">
              {designerBallsRemaining > 0 && (
                <div className="text-[10px] text-gray-600">
                  {designerBallsRemaining} ball{designerBallsRemaining !== 1 ? 's' : ''} remaining
                </div>
              )}
              {designerBallsSunk === 7 && (
                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                  <Circle className="w-3 h-3" fill="currentColor" />
                  Ready for 8-ball!
                </div>
              )}
            </div>
          </div>
          
          {/* Client Stats - Consistent border width */}
          <div className={`rounded-lg p-3 border-2 transition-all duration-150 ${
            currentPlayer === 'client' 
              ? 'bg-red-50 border-red-400 shadow-sm' 
              : 'bg-white border-gray-200'
          }`} style={{ willChange: 'background-color, border-color, box-shadow' }}>
            <div className="flex items-center justify-between mb-2 min-h-[20px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-900">Client</span>
              </div>
              <div className="w-[52px] flex justify-end">
                {currentPlayer === 'client' && (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-red-600 tabular-nums">{clientBallsSunk}</span>
              <span className="text-xs text-gray-500">/ 7 feedback cleared</span>
            </div>
            
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${(clientBallsSunk / 7) * 100}%` }}
              />
            </div>
            
            <div className="mt-2 min-h-[14px]">
              {clientBallsRemaining > 0 && (
                <div className="text-[10px] text-gray-600">
                  {clientBallsRemaining} ball{clientBallsRemaining !== 1 ? 's' : ''} remaining
                </div>
              )}
              {clientBallsSunk === 7 && (
                <div className="flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                  <Circle className="w-3 h-3" fill="currentColor" />
                  Ready for 8-ball!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ball Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Circle className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Ball Status</h3>
        </div>
        
        <div className="space-y-3">
          {/* Designer Balls Visual */}
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-2">Designer's Assets (Blue)</div>
            <div className="flex flex-wrap gap-1.5">
              {designerBalls.map(ball => (
                <div
                  key={ball.id}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                    ball.sunk 
                      ? 'opacity-30 border-gray-300' 
                      : 'border-blue-400 shadow-sm'
                  }`}
                  style={{ 
                    backgroundColor: ball.color,
                    boxShadow: ball.sunk ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {ball.sunk && (
                    <span className="text-[10px] text-white font-bold">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Client Balls Visual */}
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-2">Client's Feedback (Red)</div>
            <div className="flex flex-wrap gap-1.5">
              {clientBalls.map(ball => (
                <div
                  key={ball.id}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                    ball.sunk 
                      ? 'opacity-30 border-gray-300' 
                      : 'border-red-400 shadow-sm'
                  }`}
                  style={{ 
                    backgroundColor: ball.color,
                    boxShadow: ball.sunk ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {ball.sunk && (
                    <span className="text-[10px] text-white font-bold">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Eight Ball Status */}
          <div className={`rounded-lg p-3 border transition-all duration-150 ${
            eightBall?.sunk 
              ? 'bg-gray-100 border-gray-300' 
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-6 h-6 rounded-full border-2 transition-colors duration-150"
                style={{ 
                  backgroundColor: eightBall?.color,
                  borderColor: eightBall?.sunk ? '#9ca3af' : '#a855f7'
                }}
              />
              <span className="text-xs font-semibold text-gray-900">8-Ball Status</span>
            </div>
            <div className={`text-[10px] font-semibold transition-colors duration-150 ${
              eightBall?.sunk ? 'text-gray-600' : 'text-purple-700'
            }`}>
              {eightBall?.sunk ? '✓ Pocketed - Game Over' : '● Active - Final Deliverable'}
            </div>
            {!eightBall?.sunk && (
              <div className="mt-2 flex items-start gap-1 text-[10px] text-gray-600">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Sink this last after clearing your balls</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="text-[10px] text-gray-500 text-center">
          Properties Panel • Figma-Style UI
        </div>
      </div>
    </div>
  );
}