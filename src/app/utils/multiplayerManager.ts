import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export interface SerializableBall {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'cue' | 'designer' | 'client' | 'eight';
  number: number;
  sunk: boolean;
}

export interface GameState {
  gameId: string;
  balls: SerializableBall[];
  currentPlayer: 'designer' | 'client';
  turnNumber: number;
  designerBallsSunk: number;
  clientBallsSunk: number;
  winner: 'designer' | 'client' | 'foul' | null;
  players: {
    player1: {
      id: string;
      role: 'designer' | 'client';
      joinedAt: number;
    } | null;
    player2: {
      id: string;
      role: 'designer' | 'client';
      joinedAt: number;
    } | null;
  };
  timestamp?: number; // Add timestamp for conflict resolution
  version?: number; // Add version number for tracking
  lastUpdateBy?: string; // Track which player made the last update
  cueBallFoul?: boolean; // Track if cue ball was sunk this turn
}

// Helper function to serialize balls (remove circular references)
export function serializeBall(ball: any): SerializableBall {
  return {
    id: ball.id,
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    radius: ball.radius,
    color: ball.color,
    type: ball.type,
    number: ball.number,
    sunk: ball.sunk
  };
}

export function serializeBalls(balls: any[]): SerializableBall[] {
  return balls.map(serializeBall);
}

export class MultiplayerManager {
  private supabase;
  private channel: RealtimeChannel | null = null;
  private gameId: string;
  private isChannelReady: boolean = false;
  private backendAvailable: boolean | null = null; // null = not checked, true/false = available/unavailable
  
  constructor(gameId: string) {
    // Create a new client instance just for this game session
    this.supabase = getSupabaseClient();
    this.gameId = gameId;
    this.checkBackendHealth(); // Check backend availability on init
  }
  
  // Check if backend is available (only once per session)
  private async checkBackendHealth(): Promise<boolean> {
    if (this.backendAvailable !== null) {
      return this.backendAvailable;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Quick 2s check
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63741fa5/health`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      this.backendAvailable = response.ok;
      
      if (this.backendAvailable) {
        console.log('✅ Backend connected');
      } else {
        console.log('📦 Using localStorage mode (backend unavailable)');
      }
      
      return this.backendAvailable;
    } catch (error) {
      this.backendAvailable = false;
      console.log('📦 Using localStorage mode (backend unavailable)');
      return false;
    }
  }
  
  async subscribeToGame(callback: (state: GameState) => void) {
    // Close any existing channel first
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    
    const channelName = `game:${this.gameId}`;
    console.log(`🔌 Creating Realtime channel: ${channelName}`);
    
    try {
      this.channel = this.supabase.channel(channelName, {
        config: {
          broadcast: {
            self: false // Don't receive our own broadcasts to prevent echo/loops
          }
        }
      });
      
      this.channel
        .on('broadcast', { event: 'game_update' }, (payload) => {
          console.log('📨 Received game update via Realtime');
          callback(payload.payload as GameState);
        })
        .subscribe((status, err) => {
          console.log(`🔌 Realtime channel status: ${status}`);
          if (err) {
            console.error('⚠️ Realtime channel error details:', err);
          }
          
          if (status === 'SUBSCRIBED') {
            this.isChannelReady = true;
            console.log('✅ Realtime channel connected successfully');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Realtime channel error, falling back to localStorage only');
            console.warn('💡 This is normal if Realtime is not enabled. Game will work offline.');
            this.isChannelReady = false;
          } else if (status === 'TIMED_OUT') {
            console.warn('⚠️ Realtime channel timeout, falling back to localStorage only');
            console.warn('💡 This is normal if Realtime is not enabled. Game will work offline.');
            this.isChannelReady = false;
          } else if (status === 'CLOSED') {
            console.log('🔌 Realtime channel closed');
            this.isChannelReady = false;
          }
        });
    } catch (error) {
      console.error('❌ Failed to create Realtime channel:', error);
      console.log('💡 Continuing in offline mode with localStorage');
      this.isChannelReady = false;
    }
  }
  
  async broadcastGameState(state: GameState) {
    if (!this.channel || !this.isChannelReady) {
      // Channel not ready, skip broadcast (localStorage handles persistence)
      return;
    }
    
    try {
      // Use the newer send API with proper configuration
      await this.channel.send({
        type: 'broadcast',
        event: 'game_update',
        payload: state
      });
    } catch (error) {
      // Silently fail - localStorage handles persistence
      // This can happen if WebSocket connection is not fully established
    }
  }
  
  async saveGameState(state: GameState) {
    // Always save to localStorage first
    localStorage.setItem(`game:${this.gameId}`, JSON.stringify(state));
    
    // Only try backend if we haven't checked yet or if it's available
    if (this.backendAvailable === false) {
      return; // Skip backend save silently
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63741fa5/game/${this.gameId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(state),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.backendAvailable = true;
        console.log('✅ Game state saved to backend');
      } else {
        this.backendAvailable = false;
      }
    } catch (error) {
      this.backendAvailable = false;
      // Silent fallback - localStorage already saved
    }
  }
  
  async loadGameState(): Promise<GameState | null> {
    // Only try backend if we haven't confirmed it's unavailable
    if (this.backendAvailable !== false) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-63741fa5/game/${this.gameId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          this.backendAvailable = true;
          const data = await response.json();
          console.log('✅ Game state loaded from backend');
          return data.state as GameState;
        } else {
          this.backendAvailable = false;
        }
      } catch (error) {
        this.backendAvailable = false;
        // Silent fallback to localStorage
      }
    }
    
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(`game:${this.gameId}`);
      if (stored) {
        console.log('✅ Game state loaded from localStorage');
        return JSON.parse(stored) as GameState;
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
    }
    
    return null;
  }
  
  disconnect() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}