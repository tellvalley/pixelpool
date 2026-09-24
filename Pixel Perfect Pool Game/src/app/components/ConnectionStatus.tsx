import { Wifi, WifiOff, Clock } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isPracticeMode: boolean;
  opponentConnected: boolean;
}

export function ConnectionStatus({ isConnected, isPracticeMode, opponentConnected }: ConnectionStatusProps) {
  if (isPracticeMode) {
    return null; // No connection indicator needed in practice mode
  }

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs">
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-green-400 font-medium">Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
          <WifiOff className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400 font-medium">Offline</span>
        </div>
      )}
      
      {!opponentConnected && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs animate-pulse">
          <Clock className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 font-medium">Waiting...</span>
        </div>
      )}
    </div>
  );
}
