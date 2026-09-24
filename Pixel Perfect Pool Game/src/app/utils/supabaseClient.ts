import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

// Filter out Supabase REST fallback deprecation warnings
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  // Suppress the Supabase REST fallback deprecation warning
  if (message.includes('falling back to REST API') || 
      message.includes('httpSend()')) {
    return; // Silently ignore this specific warning
  }
  originalWarn.apply(console, args);
};

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: false, // Disable session persistence for prototype
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          },
          // Improved timeout and connection settings
          timeout: 10000,
          heartbeatIntervalMs: 30000
        },
        global: {
          headers: {
            'X-Client-Info': 'pixel-pool-game'
          }
        }
      }
    );
    
    console.log('🎮 Supabase client initialized');
  }
  
  return supabaseInstance;
}