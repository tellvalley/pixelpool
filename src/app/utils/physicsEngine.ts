import planck from 'planck-js';

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'cue' | 'designer' | 'client' | 'eight';
  number: number;
  body?: planck.Body;
  sunk: boolean;
}

export interface Pocket {
  x: number;
  y: number;
  radius: number;
}

const SCALE = 100; // pixels per meter for Planck.js

export class PhysicsEngine {
  private world: planck.World;
  private balls: Ball[];
  private pockets: Pocket[];
  private tableWidth: number;  // In meters
  private tableHeight: number;  // In meters
  private cueBallSunkThisTurn: boolean = false; // Track if cue ball was sunk
  
  // Fixed timestep like reference implementation
  time: number = 0;
  timeStep = 1000 / 60; // 60fps physics updates
  
  constructor(tableWidth: number, tableHeight: number) {
    this.tableWidth = tableWidth / SCALE;
    this.tableHeight = tableHeight / SCALE;
    
    // Set velocity threshold to 0 like reference implementation
    planck.Settings.velocityThreshold = 0;
    
    this.world = planck.World({
      gravity: planck.Vec2(0, 0)
    });
    this.balls = [];
    this.pockets = [];
    
    this.setupTable();
    this.setupPockets();
  }
  
  setupTable() {
    // Create cushion rails as static box bodies (more realistic than edges)
    const cushionThickness = 0.5; // meters
    const cushionRestitution = 0.75; // More realistic cushion bounciness (was 0.80)
    const cushionFriction = 0.3; // Increased cushion friction (was 0.2)
    
    const createCushion = (x: number, y: number, w: number, h: number) => {
      const body = this.world.createBody({
        type: 'static',
        position: planck.Vec2(x, y)
      });
      
      body.createFixture({
        shape: planck.Box(w / 2, h / 2),
        friction: cushionFriction,
        restitution: cushionRestitution
      });
      
      return body;
    };
    
    // Top cushion
    createCushion(this.tableWidth / 2, -cushionThickness / 2, this.tableWidth, cushionThickness);
    
    // Bottom cushion
    createCushion(this.tableWidth / 2, this.tableHeight + cushionThickness / 2, this.tableWidth, cushionThickness);
    
    // Left cushion
    createCushion(-cushionThickness / 2, this.tableHeight / 2, cushionThickness, this.tableHeight);
    
    // Right cushion
    createCushion(this.tableWidth + cushionThickness / 2, this.tableHeight / 2, cushionThickness, this.tableHeight);
  }
  
  setupPockets() {
    const pocketRadius = 25;
    const offset = 30;
    
    this.pockets = [
      { x: offset, y: offset, radius: pocketRadius }, // Top-left
      { x: this.tableWidth * SCALE / 2, y: offset, radius: pocketRadius }, // Top-center
      { x: this.tableWidth * SCALE - offset, y: offset, radius: pocketRadius }, // Top-right
      { x: offset, y: this.tableHeight * SCALE - offset, radius: pocketRadius }, // Bottom-left
      { x: this.tableWidth * SCALE / 2, y: this.tableHeight * SCALE - offset, radius: pocketRadius }, // Bottom-center
      { x: this.tableWidth * SCALE - offset, y: this.tableHeight * SCALE - offset, radius: pocketRadius }, // Bottom-right
    ];
  }
  
  addBall(ball: Ball) {
    const body = this.world.createBody({
      type: 'dynamic',
      position: planck.Vec2(ball.x / SCALE, ball.y / SCALE),
      linearDamping: 1.2,    // Slightly increased table friction for better control
      angularDamping: 0.8,   // Increased spin damping for more realistic roll
      bullet: true,          // Continuous collision detection for fast balls
      allowSleep: true       // Allow bodies to sleep when at rest
    });
    
    body.createFixture({
      shape: planck.Circle(ball.radius / SCALE),
      density: 2.7,          // Slightly heavier for more realistic ball weight
      friction: 0.35,        // Higher ball-to-ball friction for realistic interactions
      restitution: 0.92      // Reduced bounciness for more realistic energy loss
    });
    
    // Set initial velocity if any
    if (ball.vx !== 0 || ball.vy !== 0) {
      body.setLinearVelocity(planck.Vec2(ball.vx, ball.vy));
    }
    
    // Store reference to ball in body's user data
    body.setUserData(ball);
    
    ball.body = body;
    this.balls.push(ball);
  }
  
  applyImpulse(ballId: string, impulseX: number, impulseY: number) {
    const ball = this.balls.find(b => b.id === ballId);
    if (ball && ball.body) {
      console.log(`⚡ Applying impulse to ${ballId}: (${impulseX.toFixed(4)}, ${impulseY.toFixed(4)})`);
      
      // Wake up the body
      ball.body.setAwake(true);
      
      // Apply impulse at center of ball
      const impulse = planck.Vec2(impulseX, impulseY);
      const position = ball.body.getPosition();
      ball.body.applyLinearImpulse(impulse, position, true);
      
      // Log velocity after impulse
      const vel = ball.body.getLinearVelocity();
      console.log(`📊 Velocity after impulse: (${vel.x.toFixed(4)}, ${vel.y.toFixed(4)})`);
      
      // Check if body is awake
      console.log(`👁️ Body is awake: ${ball.body.isAwake()}`);
    } else {
      console.error(`❌ Ball ${ballId} not found or has no body!`);
    }
  }
  
  step(deltaTime: number) {
    // Accumulate time and step with fixed timestep
    this.time += deltaTime * 1000; // Convert to milliseconds
    
    // Step the world with fixed timestep
    while (this.time >= this.timeStep) {
      this.time -= this.timeStep;
      this.world.step(this.timeStep / 1000); // Convert back to seconds
    }
    
    // Update ball positions from physics bodies
    this.balls.forEach((ball) => {
      if (ball.body && !ball.sunk) {
        const pos = ball.body.getPosition();
        const vel = ball.body.getLinearVelocity();
        
        ball.x = pos.x * SCALE;
        ball.y = pos.y * SCALE;
        ball.vx = vel.x;
        ball.vy = vel.y;
        
        // Check for pockets
        this.checkPockets(ball);
      }
    });
  }
  
  checkPockets(ball: Ball) {
    for (const pocket of this.pockets) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < pocket.radius) {
        console.log(`🕳️ Ball ${ball.id} (type: ${ball.type}) potted! Distance: ${distance.toFixed(2)}, Pocket radius: ${pocket.radius}`);
        
        // Special handling for cue ball - respawn it after balls stop moving
        if (ball.type === 'cue') {
          console.log('⚪ Cue ball potted! Will respawn when balls stop moving...');
          // Set the foul flag
          this.cueBallSunkThisTurn = true;
          // Destroy the body but don't mark as sunk
          if (ball.body) {
            this.world.destroyBody(ball.body);
            ball.body = undefined;
          }
          // Move cue ball off-screen temporarily so it doesn't interfere
          ball.x = -1000;
          ball.y = -1000;
          // Wait for all balls to stop before respawning
          this.waitForBallsToStopThenRespawn(ball);
        } else {
          // For non-cue balls, mark as sunk normally
          ball.sunk = true;
          if (ball.body) {
            this.world.destroyBody(ball.body);
            ball.body = undefined;
          }
        }
        
        break;
      }
    }
  }
  
  waitForBallsToStopThenRespawn(ball: Ball) {
    // Check if balls are still moving
    const checkAndRespawn = () => {
      if (this.isMoving()) {
        console.log('⏳ Balls still moving, waiting to respawn cue ball...');
        // Check again in 100ms
        setTimeout(checkAndRespawn, 100);
      } else {
        console.log('✅ Balls stopped, respawning cue ball now');
        this.respawnCueBall(ball);
      }
    };
    
    // Start checking after a small initial delay
    setTimeout(checkAndRespawn, 100);
  }
  
  respawnCueBall(ball: Ball) {
    // Reset sunk status
    ball.sunk = false;
    
    // Place cue ball at the starting position (left quarter of table, center vertically)
    // tableWidth and tableHeight are in meters, so multiply by SCALE to get pixels
    const respawnX = (this.tableWidth * SCALE) * 0.25; // 25% from left in pixels
    const respawnY = (this.tableHeight * SCALE) * 0.5; // Center vertically in pixels
    
    ball.x = respawnX;
    ball.y = respawnY;
    ball.vx = 0;
    ball.vy = 0;
    
    // Recreate physics body (convert back to meters for physics)
    const body = this.world.createBody({
      type: 'dynamic',
      position: planck.Vec2(respawnX / SCALE, respawnY / SCALE),
      linearDamping: 1.2,    // Match updated realistic values
      angularDamping: 0.8,   // Match updated realistic values
      bullet: true,
      allowSleep: true
    });
    
    body.createFixture({
      shape: planck.Circle(ball.radius / SCALE),
      density: 2.7,          // Match updated realistic values
      friction: 0.35,        // Match updated realistic values
      restitution: 0.92      // Match updated realistic values
    });
    
    body.setUserData(ball);
    ball.body = body;
    
    console.log(`✅ Cue ball respawned at (${respawnX.toFixed(0)}, ${respawnY.toFixed(0)}) pixels`);
  }
  
  isMoving(): boolean {
    // Check if any ball body is awake (reference implementation method)
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      if (body.getType() === 'dynamic' && body.isAwake()) {
        const vel = body.getLinearVelocity();
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        // Consider moving if speed is above threshold
        if (speed > 0.005) {
          return true;
        }
      }
    }
    return false;
  }
  
  areAllBallsAsleep(): boolean {
    // Alternative method: check if all dynamic bodies are asleep
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      if (body.getType() === 'dynamic' && body.isAwake()) {
        return false;
      }
    }
    return true;
  }
  
  getAllBalls(): Ball[] {
    return this.balls;
  }
  
  // Get balls without physics bodies (serializable)
  getSerializableBalls(): Array<Omit<Ball, 'body'>> {
    const ballsArray = this.balls;
    const sunkCount = ballsArray.filter(b => b.sunk).length;
    
    // Debug: Log sunk balls
    if (sunkCount > 0) {
      console.log(`🔍 PhysicsEngine.getSerializableBalls: Total balls=${ballsArray.length}, Sunk=${sunkCount}`);
      const sunkBalls = ballsArray.filter(b => b.sunk);
      console.log(`   Sunk balls: ${sunkBalls.map(b => `${b.id}(${b.type})`).join(', ')}`);
    }
    
    return ballsArray.map(ball => ({
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
    }));
  }
  
  // Check if cue ball was sunk during this turn
  wasCueBallSunk(): boolean {
    return this.cueBallSunkThisTurn;
  }
  
  // Reset the cue ball foul flag (call at start of new turn)
  resetCueBallFoul() {
    this.cueBallSunkThisTurn = false;
  }
}