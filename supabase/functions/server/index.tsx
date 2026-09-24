import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-63741fa5/health", (c) => {
  return c.json({ status: "ok" });
});

// Save game state
app.post("/make-server-63741fa5/game/:gameId", async (c) => {
  try {
    const gameId = c.req.param("gameId");
    const state = await c.req.json();
    
    console.log(`💾 Saving game state for: ${gameId}`);
    await kv.set(`game:${gameId}`, state);
    console.log(`✅ Game state saved successfully for: ${gameId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving game state:", error);
    return c.json({ 
      error: "Failed to save game state",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Load game state
app.get("/make-server-63741fa5/game/:gameId", async (c) => {
  try {
    const gameId = c.req.param("gameId");
    console.log(`📖 Loading game state for: ${gameId}`);
    
    const state = await kv.get(`game:${gameId}`);
    
    if (!state) {
      console.log(`⚠️ No state found for: ${gameId}`);
      return c.json({ state: null });
    }
    
    console.log(`✅ Game state loaded successfully for: ${gameId}`);
    return c.json({ state });
  } catch (error) {
    console.error("❌ Error loading game state:", error);
    return c.json({ 
      error: "Failed to load game state",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

Deno.serve(app.fetch);