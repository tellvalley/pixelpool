import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { PoolTable } from "./components/PoolTable";
import { LayersPanel } from "./components/LayersPanel";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { GameOverModal } from "./components/GameOverModal";
import { GameTipsModal } from "./components/GameTipsModal";
import { LoadScreen } from "./components/LoadScreen";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Ball } from "./utils/physicsEngine";
import {
  MultiplayerManager,
  GameState,
  serializeBalls,
} from "./utils/multiplayerManager";
import {
  Undo2,
  Users,
  Copy,
  Check,
  Target,
  ArrowLeft,
  Plus,
  LogIn,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { soundManager } from "./utils/soundManager";

type MenuState =
  | "main"
  | "new-game-role-select"
  | "join-game-enter-code";

export default function App() {
  const [showLoadScreen, setShowLoadScreen] = useState(true);
  const [menuState, setMenuState] = useState<MenuState>("main");
  const [gameId, setGameId] = useState<string>("");
  const [inputGameId, setInputGameId] = useState<string>("");
  const [playerRole, setPlayerRole] = useState<
    "designer" | "client" | null
  >(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<
    "designer" | "client"
  >("designer");
  const [turnNumber, setTurnNumber] = useState(1);
  const [designerBallsSunk, setDesignerBallsSunk] = useState(0);
  const [clientBallsSunk, setClientBallsSunk] = useState(0);
  const [winner, setWinner] = useState<
    "designer" | "client" | "foul" | null
  >(null);
  const [multiplayerManager, setMultiplayerManager] =
    useState<MultiplayerManager | null>(null);
  const [previousGameState, setPreviousGameState] =
    useState<GameState | null>(null);
  const [undoUsed, setUndoUsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const lastBroadcastTime = useRef<number>(0);
  const BROADCAST_THROTTLE = 100;
  const [playerId] = useState<string>(() =>
    crypto.randomUUID(),
  );
  const [opponentRole, setOpponentRole] = useState<
    "designer" | "client" | null
  >(null);
  const playerSlot = useRef<"player1" | "player2" | null>(null);
  const playersState = useRef<GameState["players"]>({
    player1: null,
    player2: null,
  });
  const lastReceivedState = useRef<GameState | null>(null);
  const currentStateVersion = useRef<number>(0);
  const isProcessingRemoteUpdate = useRef<boolean>(false);
  const shotInProgress = useRef<boolean>(false);
  const ballsBeforeShot = useRef<Ball[]>([]);
  
  // Calculate if it's the current player's turn
  const isMyTurn = isPracticeMode || currentPlayer === playerRole;
  
  // Store balls before shot starts
  const handleShotStart = useCallback((ballsBeforeShot: Ball[]) => {
    ballsBeforeShot.current = ballsBeforeShot;
  }, []);

  const initializeBalls = useCallback((): Ball[] => {
    const ballRadius = 15;
    const tableWidth = 900;
    const tableHeight = 500;

    const cueBall: Ball = {
      id: "cue",
      x: tableWidth * 0.25,
      y: tableHeight / 2,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      color: "#ffffff",
      type: "cue",
      number: 0,
      sunk: false,
    };

    const designerBalls: Ball[] = [
      {
        id: "d1",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#3b82f6",
        type: "designer",
        number: 1,
        sunk: false,
      },
      {
        id: "d2",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#60a5fa",
        type: "designer",
        number: 2,
        sunk: false,
      },
      {
        id: "d3",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#2563eb",
        type: "designer",
        number: 3,
        sunk: false,
      },
      {
        id: "d4",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#1d4ed8",
        type: "designer",
        number: 4,
        sunk: false,
      },
      {
        id: "d5",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#1e40af",
        type: "designer",
        number: 5,
        sunk: false,
      },
      {
        id: "d6",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#93c5fd",
        type: "designer",
        number: 6,
        sunk: false,
      },
      {
        id: "d7",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#dbeafe",
        type: "designer",
        number: 7,
        sunk: false,
      },
    ];

    const clientBalls: Ball[] = [
      {
        id: "c1",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#ef4444",
        type: "client",
        number: 9,
        sunk: false,
      },
      {
        id: "c2",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#f87171",
        type: "client",
        number: 10,
        sunk: false,
      },
      {
        id: "c3",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#dc2626",
        type: "client",
        number: 11,
        sunk: false,
      },
      {
        id: "c4",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#b91c1c",
        type: "client",
        number: 12,
        sunk: false,
      },
      {
        id: "c5",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#991b1b",
        type: "client",
        number: 13,
        sunk: false,
      },
      {
        id: "c6",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#fca5a5",
        type: "client",
        number: 14,
        sunk: false,
      },
      {
        id: "c7",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        color: "#fecaca",
        type: "client",
        number: 15,
        sunk: false,
      },
    ];

    const eightBall: Ball = {
      id: "eight",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      color: "#000000",
      type: "eight",
      number: 8,
      sunk: false,
    };

    const startX = tableWidth * 0.7;
    const startY = tableHeight / 2;
    const spacing = ballRadius * 2.1;

    const allRackBalls = [
      ...designerBalls,
      ...clientBalls,
      eightBall,
    ];
    const shuffled = allRackBalls.sort(
      () => Math.random() - 0.5,
    );

    let ballIndex = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        if (ballIndex < shuffled.length) {
          const ball = shuffled[ballIndex];
          ball.x = startX + row * spacing * 0.866;
          ball.y = startY + (col - row / 2) * spacing;
          ballIndex++;
        }
      }
    }

    return [cueBall, ...shuffled];
  }, []);

  const checkWinCondition = useCallback(
    (updatedBalls: Ball[]) => {
      const cueBallSunk = updatedBalls.find(
        (b) => b.type === "cue",
      )?.sunk;
      const eightBallSunk = updatedBalls.find(
        (b) => b.type === "eight",
      )?.sunk;
      const designerBallsRemaining = updatedBalls.filter(
        (b) => b.type === "designer" && !b.sunk,
      ).length;
      const clientBallsRemaining = updatedBalls.filter(
        (b) => b.type === "client" && !b.sunk,
      ).length;

      if (
        eightBallSunk &&
        (designerBallsRemaining > 0 || clientBallsRemaining > 0)
      ) {
        const loser = currentPlayer;
        const winnerPlayer =
          loser === "designer" ? "client" : "designer";

        console.log(
          `🚨 8-BALL SUNK EARLY! ${loser} loses, ${winnerPlayer} wins!`,
        );
        setWinner(winnerPlayer);

        if (multiplayerManager) {
          const lossState: GameState = {
            gameId,
            balls: serializeBalls(updatedBalls),
            currentPlayer,
            turnNumber,
            designerBallsSunk: updatedBalls.filter(
              (b) => b.type === "designer" && b.sunk,
            ).length,
            clientBallsSunk: updatedBalls.filter(
              (b) => b.type === "client" && b.sunk,
            ).length,
            winner: winnerPlayer,
            players: playersState.current,
          };
          multiplayerManager.broadcastGameState(lossState);
          multiplayerManager.saveGameState(lossState);
        }
        return;
      }

      if (cueBallSunk) {
        return;
      }

      if (designerBallsRemaining === 0 && eightBallSunk) {
        setWinner("designer");
        // Play victory/defeat sound based on player role
        if (playerRole === "designer") {
          soundManager.playVictory();
        } else if (playerRole === "client") {
          soundManager.playDefeat();
        }
        return;
      }

      if (clientBallsRemaining === 0 && eightBallSunk) {
        setWinner("client");
        // Play victory/defeat sound based on player role
        if (playerRole === "client") {
          soundManager.playVictory();
        } else if (playerRole === "designer") {
          soundManager.playDefeat();
        }
        return;
      }
    },
    [currentPlayer, gameId, turnNumber, multiplayerManager, playerRole],
  );

  const handleBallsUpdate = useCallback(
    (updatedBalls: Ball[]) => {
      // Don't update if we're processing a remote update
      if (isProcessingRemoteUpdate.current) {
        return;
      }

      // Only broadcast state if it's actually our turn in multiplayer
      const isOurTurn = isPracticeMode || currentPlayer === playerRole;
      if (!isPracticeMode && !isOurTurn) {
        // Not our turn, don't broadcast (just update locally for smooth animation)
        setBalls(updatedBalls);
        return;
      }

      setBalls(updatedBalls);

      const designerSunk = updatedBalls.filter(
        (b) => b.type === "designer" && b.sunk,
      ).length;
      const clientSunk = updatedBalls.filter(
        (b) => b.type === "client" && b.sunk,
      ).length;

      setDesignerBallsSunk(designerSunk);
      setClientBallsSunk(clientSunk);

      if (multiplayerManager && !isPracticeMode && isOurTurn) {
        currentStateVersion.current++;
        const currentState: GameState = {
          gameId,
          balls: serializeBalls(updatedBalls),
          currentPlayer,
          turnNumber,
          designerBallsSunk: designerSunk,
          clientBallsSunk: clientSunk,
          winner,
          players: playersState.current,
          timestamp: Date.now(),
          version: currentStateVersion.current,
          lastUpdateBy: playerId,
        };
        
        // Broadcast every update immediately - let Supabase handle rate limiting
        multiplayerManager.broadcastGameState(currentState);
        
        // Save to database with throttling to avoid excessive writes
        const currentTime = Date.now();
        if (
          currentTime - lastBroadcastTime.current >
          BROADCAST_THROTTLE
        ) {
          multiplayerManager.saveGameState(currentState);
          lastBroadcastTime.current = currentTime;
        }
      }

      checkWinCondition(updatedBalls);
    },
    [
      checkWinCondition,
      multiplayerManager,
      isPracticeMode,
      gameId,
      currentPlayer,
      turnNumber,
      winner,
      playerRole,
      playerId,
    ],
  );

  const handleTurnComplete = useCallback(() => {
    // Before shot state
    const ballsBeforeTurn = ballsBeforeShot.current;
    
    // After shot state  
    const currentBalls = balls;
    
    // Determine which balls were sunk during this shot
    const ballsSunkThisTurn = currentBalls.filter((ball, idx) => {
      const beforeBall = ballsBeforeTurn.find(b => b.id === ball.id);
      return beforeBall && !beforeBall.sunk && ball.sunk;
    });
    
    console.log(`🎯 Turn complete - Balls sunk this turn:`, ballsSunkThisTurn.map(b => `${b.type}-${b.number}`));
    
    // Check if cue ball was sunk by comparing before/after position
    // The cue ball respawns at tableWidth * 0.25, tableHeight * 0.5 = (225, 250)
    const cueBallBefore = ballsBeforeTurn.find(b => b.type === 'cue');
    const cueBallAfter = currentBalls.find(b => b.type === 'cue');
    
    const RESPAWN_X = 225; // tableWidth (900) * 0.25
    const RESPAWN_Y = 250; // tableHeight (500) * 0.5
    
    // If cue ball moved to respawn position, it was sunk
    const cueBallSunk = cueBallBefore && cueBallAfter &&
                        Math.abs(cueBallAfter.x - RESPAWN_X) < 5 &&
                        Math.abs(cueBallAfter.y - RESPAWN_Y) < 5 &&
                        (Math.abs(cueBallBefore.x - RESPAWN_X) > 10 || Math.abs(cueBallBefore.y - RESPAWN_Y) > 10);
    
    if (cueBallSunk) {
      console.log('🚫 CUE BALL SUNK - Switch turn');
      switchTurn();
      return;
    }
    
    // AUTOMATIC ASSIGNMENT: Designer plays "designer" balls, Client plays "client" balls
    const currentPlayerBallType = currentPlayer; // "designer" or "client"
    
    // Determine if player sunk their own balls
    const playerBallsSunk = ballsSunkThisTurn.filter(b => b.type === currentPlayerBallType);
    const opponentBallsSunk = ballsSunkThisTurn.filter(b => 
      (b.type === 'designer' || b.type === 'client') && b.type !== currentPlayerBallType
    );
    
    console.log(`📊 ${currentPlayer} balls sunk: ${playerBallsSunk.length}, Opponent balls sunk: ${opponentBallsSunk.length}`);
    
    // Realistic pool rules:
    // 1. If player sinks at least one of their own balls -> continue turn (even if opponent balls also sunk)
    // 2. If player sinks ONLY opponent balls OR no balls -> switch turn
    // 3. If no balls assigned yet and player didn't sink any -> switch turn
    
    let shouldContinueTurn = false;
    
    if (playerBallsSunk.length > 0) {
      // Balls are assigned - check if player sunk their own balls
      shouldContinueTurn = true;
    } else if (opponentBallsSunk.length > 0 || ballsSunkThisTurn.length === 0) {
      // No balls sunk or only opponent balls - switch turn
      shouldContinueTurn = false;
    }
    
    if (shouldContinueTurn) {
      console.log('✅ Player sunk their ball(s) - CONTINUE TURN');
      soundManager.playTurn(); // Play a positive sound
      
      // Save state but don't switch player
      const currentState: GameState = {
        gameId,
        balls: serializeBalls(balls),
        currentPlayer, // Keep same player
        turnNumber,
        designerBallsSunk,
        clientBallsSunk,
        winner,
        players: playersState.current,
        timestamp: Date.now(),
        version: ++currentStateVersion.current,
        lastUpdateBy: playerId,
      };
      
      setPreviousGameState(currentState);
      
      if (multiplayerManager) {
        multiplayerManager.broadcastGameState(currentState);
        multiplayerManager.saveGameState(currentState);
      }
    } else {
      console.log('🔄 No valid balls sunk or only opponent balls - SWITCH TURN');
      switchTurn();
    }
  }, [
    balls,
    currentPlayer,
    turnNumber,
    designerBallsSunk,
    clientBallsSunk,
    winner,
    gameId,
    multiplayerManager,
    playerId,
  ]);
  
  // Helper function to switch turn
  const switchTurn = useCallback(() => {
    const currentState: GameState = {
      gameId,
      balls: serializeBalls(balls),
      currentPlayer,
      turnNumber,
      designerBallsSunk,
      clientBallsSunk,
      winner,
      players: playersState.current,
    };
    setPreviousGameState(currentState);

    const nextPlayer =
      currentPlayer === "designer" ? "client" : "designer";
    setCurrentPlayer(nextPlayer);
    setTurnNumber((prev) => prev + 1);

    if (multiplayerManager) {
      currentStateVersion.current++;
      const newState: GameState = {
        ...currentState,
        currentPlayer: nextPlayer,
        turnNumber: turnNumber + 1,
        timestamp: Date.now(),
        version: currentStateVersion.current,
        lastUpdateBy: playerId,
      };
      multiplayerManager.broadcastGameState(newState);
      multiplayerManager.saveGameState(newState);
    }
  }, [
    balls,
    currentPlayer,
    turnNumber,
    designerBallsSunk,
    clientBallsSunk,
    winner,
    gameId,
    multiplayerManager,
    playerId,
  ]);

  const handleUndo = () => {
    if (undoUsed || !previousGameState) {
      return;
    }

    setBalls(previousGameState.balls);
    setCurrentPlayer(previousGameState.currentPlayer);
    setTurnNumber(previousGameState.turnNumber);
    setDesignerBallsSunk(previousGameState.designerBallsSunk);
    setClientBallsSunk(previousGameState.clientBallsSunk);
    setWinner(previousGameState.winner);
    setUndoUsed(true);

    if (multiplayerManager) {
      multiplayerManager.broadcastGameState(previousGameState);
      multiplayerManager.saveGameState(previousGameState);
    }
  };

  const startMultiplayerGame = useCallback(
    async (
      gameIdToUse: string,
      selectedRole: "designer" | "client",
      isCreatingNew: boolean,
    ) => {
      console.log(
        `🎮 Starting multiplayer game - ID: ${gameIdToUse}, Role: ${selectedRole}, IsNew: ${isCreatingNew}`,
      );
      setPlayerRole(selectedRole);
      setGameId(gameIdToUse);
      setIsPracticeMode(false);

      const manager = new MultiplayerManager(gameIdToUse);
      setMultiplayerManager(manager);

      try {
        const existingState = await manager.loadGameState();

        if (
          existingState &&
          existingState.balls &&
          existingState.balls.length > 0 &&
          existingState.players.player1
        ) {
          // Joining existing game
          playerSlot.current = "player2";
          console.log("🎮 Joining as Player 2");

          // Automatically assign opposite role
          const autoRole =
            existingState.players.player1.role === "designer"
              ? "client"
              : "designer";
          setPlayerRole(autoRole);
          setOpponentRole(existingState.players.player1.role);

          setBalls(existingState.balls);
          setCurrentPlayer(existingState.currentPlayer);
          setTurnNumber(existingState.turnNumber);
          setDesignerBallsSunk(existingState.designerBallsSunk);
          setClientBallsSunk(existingState.clientBallsSunk);
          setWinner(existingState.winner);

          const newState: GameState = {
            ...existingState,
            players: {
              player1: existingState.players.player1,
              player2: {
                id: playerId,
                role: autoRole,
                joinedAt: Date.now(),
              },
            },
          };

          playersState.current = newState.players;
          manager.broadcastGameState(newState);
          manager.saveGameState(newState);
        } else if (!isCreatingNew) {
          // Trying to join a game that doesn't exist
          console.error(`❌ Game ${gameIdToUse} does not exist`);
          alert(`Game ID "${gameIdToUse}" not found. Please check the ID and try again.`);
          manager.disconnect();
          setMultiplayerManager(null);
          setGameId("");
          setPlayerRole(null);
          return;
        } else {
          // Creating new game
          playerSlot.current = "player1";
          console.log("🎮 Creating new game as Player 1");

          const initialBalls = initializeBalls();
          setBalls(initialBalls);

          const initialState: GameState = {
            gameId: gameIdToUse,
            balls: serializeBalls(initialBalls),
            currentPlayer: "designer",
            turnNumber: 1,
            designerBallsSunk: 0,
            clientBallsSunk: 0,
            winner: null,
            players: {
              player1: {
                id: playerId,
                role: selectedRole,
                joinedAt: Date.now(),
              },
              player2: null,
            },
          };

          playersState.current = initialState.players;
          manager.broadcastGameState(initialState);
          manager.saveGameState(initialState);
        }

        // Subscribe to updates
        manager.subscribeToGame((state: GameState) => {
          console.log(`📡 Received update - Turn: ${state.turnNumber}, CurrentPlayer: ${state.currentPlayer}, LastUpdateBy: ${state.lastUpdateBy || 'unknown'}`);

          const lastState = lastReceivedState.current;
          
          // Ignore updates from ourselves (safety check)
          if (state.lastUpdateBy === playerId) {
            console.log('⏭️ Ignoring own update');
            return;
          }

          // Version-based conflict resolution
          if (state.version && currentStateVersion.current >= state.version) {
            console.log(`⏭️ Ignoring older/same version (local: ${currentStateVersion.current}, remote: ${state.version})`);
            return;
          }

          const isPlayerUpdate =
            !lastState ||
            (!lastState.players.player2 &&
              state.players.player2) ||
            (!lastState.players.player1 &&
              state.players.player1);

          const isGameUpdate =
            !lastState ||
            state.currentPlayer !== lastState.currentPlayer ||
            state.turnNumber !== lastState.turnNumber ||
            state.designerBallsSunk !==
              lastState.designerBallsSunk ||
            state.clientBallsSunk !==
              lastState.clientBallsSunk ||
            state.winner !== lastState.winner;
          
          // Check if ball positions or sunk states changed
          const isBallUpdate = !lastState || 
            JSON.stringify(state.balls) !== JSON.stringify(lastState.balls);

          if (!isPlayerUpdate && !isGameUpdate && !isBallUpdate) {
            console.log('⏭️ No significant changes');
            return;
          }

          // Set flag to prevent local updates during remote processing
          isProcessingRemoteUpdate.current = true;

          console.log(`✅ Applying remote update v${state.version || 0}`);
          lastReceivedState.current = state;
          playersState.current = state.players;

          // Update state version if provided
          if (state.version) {
            currentStateVersion.current = state.version;
          }

          if (
            playerSlot.current === "player1" &&
            state.players.player2
          ) {
            setOpponentRole(state.players.player2.role);
          } else if (
            playerSlot.current === "player2" &&
            state.players.player1
          ) {
            setOpponentRole(state.players.player1.role);
          }

          setBalls(state.balls);
          setCurrentPlayer(state.currentPlayer);
          setTurnNumber(state.turnNumber);
          setDesignerBallsSunk(state.designerBallsSunk);
          setClientBallsSunk(state.clientBallsSunk);
          setWinner(state.winner);

          // Reset processing flag after state updates settle
          setTimeout(() => {
            isProcessingRemoteUpdate.current = false;
          }, 100);
        });

        setGameStarted(true);
        setShowTipsModal(true);
      } catch (error) {
        console.error("Error starting game:", error);
      }
    },
    [initializeBalls, playerId],
  );

  const handleNewGameWithRole = (
    role: "designer" | "client",
  ) => {
    // Generate a 6-character alphanumeric game ID
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters like 0, O, 1, I
    let newGameId = '';
    for (let i = 0; i < 6; i++) {
      newGameId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(`🎮 Generated new game ID: ${newGameId}`);
    startMultiplayerGame(newGameId, role, true);
  };

  const handleJoinWithCode = () => {
    if (!inputGameId.trim()) {
      alert("Please enter a game ID");
      return;
    }
    
    // Validate game ID format (6 alphanumeric characters)
    const gameIdPattern = /^[A-Z0-9]{6}$/i;
    const cleanGameId = inputGameId.trim().toUpperCase();
    
    if (!gameIdPattern.test(cleanGameId)) {
      alert("Invalid game ID format. Game ID must be exactly 6 characters.");
      return;
    }
    
    console.log(`🔍 Attempting to join game: ${cleanGameId}`);
    startMultiplayerGame(cleanGameId, "designer", false); // Role will be auto-assigned
  };

  const handleStartPracticeMode = () => {
    const newGameId = `practice-${Date.now()}`;
    setGameId(newGameId);
    setPlayerRole("designer");
    setIsPracticeMode(true);

    const initialBalls = initializeBalls();
    setBalls(initialBalls);
    setGameStarted(true);
    setShowTipsModal(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setWinner(null);
    setCurrentPlayer("designer");
    setTurnNumber(1);
    setDesignerBallsSunk(0);
    setClientBallsSunk(0);
    setUndoUsed(false);
    setPreviousGameState(null);
    setGameId("");
    setPlayerRole(null);
    setIsPracticeMode(false);
    setOpponentRole(null);
    setMenuState("main");
    setInputGameId("");
    playerSlot.current = null;

    if (multiplayerManager) {
      multiplayerManager.disconnect();
      setMultiplayerManager(null);
    }
  };

  const copyGameId = () => {
    if (gameId) {
      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        navigator.clipboard
          .writeText(gameId)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            fallbackCopy(gameId);
          });
      } else {
        fallbackCopy(gameId);
      }
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }

    document.body.removeChild(textarea);
  };

  useEffect(() => {
    return () => {
      if (multiplayerManager) {
        multiplayerManager.disconnect();
      }
    };
  }, [multiplayerManager]);

  // Polling fallback
  useEffect(() => {
    if (
      !isPracticeMode &&
      gameStarted &&
      multiplayerManager &&
      !opponentRole
    ) {
      const pollInterval = setInterval(async () => {
        try {
          const state =
            await multiplayerManager.loadGameState();
          if (state) {
            if (
              playerSlot.current === "player1" &&
              state.players.player2 &&
              !opponentRole
            ) {
              console.log("🎉 [POLL] Opponent detected!");
              setOpponentRole(state.players.player2.role);
              playersState.current = state.players;
              clearInterval(pollInterval);
            } else if (
              playerSlot.current === "player2" &&
              state.players.player1 &&
              !opponentRole
            ) {
              console.log("🎉 [POLL] Opponent detected!");
              setOpponentRole(state.players.player1.role);
              playersState.current = state.players;
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [
    isPracticeMode,
    gameStarted,
    multiplayerManager,
    opponentRole,
  ]);

  if (showLoadScreen) {
    return (
      <LoadScreen onComplete={() => setShowLoadScreen(false)} />
    );
  }

  if (!gameStarted) {
    return (
      <div className="size-full bg-[#1e1e1e] flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-[#2c2c2c] rounded-lg border border-[#3d3d3d] shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Pixel Pool
            </h1>
            <p className="text-gray-400 text-sm">
              The Designer's 8-Ball
            </p>
          </div>

          {menuState === "main" && (
            <>
              <div className="space-y-3 mb-6">
                <Button
                  onClick={handleStartPracticeMode}
                  className="w-full bg-[#F8E4C9] hover:bg-[#ede3d0] text-[#443018] font-semibold py-6 border-2 border-[#443018]/20"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Practice Mode
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3d3d3d]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#2c2c2c] px-2 text-gray-500">
                      or play multiplayer
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={() =>
                    setMenuState("new-game-role-select")
                  }
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-6 border-2 border-gray-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Game
                </Button>
                <Button
                  onClick={() =>
                    setMenuState("join-game-enter-code")
                  }
                  className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-6 border-2 border-gray-700"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Join Game
                </Button>
              </div>
            </>
          )}

          {menuState === "new-game-role-select" && (
            <>
              <Button
                onClick={() => setMenuState("main")}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="mb-6">
                <h2 className="text-white text-lg font-semibold mb-2">
                  Select Your Role
                </h2>
                <p className="text-gray-400 text-sm">
                  Choose which team you want to play as
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() =>
                    handleNewGameWithRole("designer")
                  }
                  className="w-full bg-[#F8E4C9] hover:bg-[#ede3d0] text-[#443018] font-semibold py-6"
                >
                  🎨 Designer
                  <span className="block text-xs opacity-80 mt-1">
                    Sink the blue Asset balls
                  </span>
                </Button>
                <Button
                  onClick={() =>
                    handleNewGameWithRole("client")
                  }
                  className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-6 border-2 border-gray-700"
                >
                  💬 Client
                  <span className="block text-xs opacity-80 mt-1">
                    Sink the red Feedback balls
                  </span>
                </Button>
              </div>
            </>
          )}

          {menuState === "join-game-enter-code" && (
            <>
              <Button
                onClick={() => setMenuState("main")}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="mb-6">
                <h2 className="text-white text-lg font-semibold mb-2">
                  Join Existing Game
                </h2>
                <p className="text-gray-400 text-sm">
                  Enter the game ID shared by your opponent
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Paste Game ID here..."
                  value={inputGameId}
                  onChange={(e) =>
                    setInputGameId(e.target.value)
                  }
                  className="bg-[#1e1e1e] border-[#3d3d3d] text-white py-6 text-center"
                />
                <Button
                  onClick={handleJoinWithCode}
                  disabled={!inputGameId.trim()}
                  className="w-full bg-[#F8E4C9] hover:bg-[#ede3d0] text-[#443018] font-semibold py-6"
                >
                  Join Game
                </Button>
                <p className="text-gray-500 text-xs text-center">
                  Your role will be automatically assigned
                </p>
              </div>
            </>
          )}

          {menuState === "main" && (
            <div className="p-4 bg-[#1e1e1e] rounded border border-[#3d3d3d]">
              <h3 className="text-white text-sm font-semibold mb-2">
                How to Play:
              </h3>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• Designer sinks blue "Asset" balls</li>
                <li>• Client sinks red "Feedback" balls</li>
                <li>
                  • Sink all your balls, then the 8-ball to win
                </li>
                <li>• Drag from cue ball to shoot</li>
                <li>• Use Undo (Cmd+Z) once per game</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-[#1e1e1e] flex flex-col md:flex-row overflow-hidden">
      {/* Hide panels on small screens or in focus mode */}
      {!focusMode && (
        <div className="hidden md:block">
          <LayersPanel
            balls={balls}
            currentPlayer={currentPlayer}
            designerBallsSunk={designerBallsSunk}
            clientBallsSunk={clientBallsSunk}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-14 bg-[#2c2c2c] border-b border-[#1e1e1e] flex items-center justify-between px-3 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <h1 className="text-white font-semibold text-sm md:text-base whitespace-nowrap">
              Pixel Pool
            </h1>
            {isPracticeMode ? (
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 whitespace-nowrap">
                Practice Mode
              </span>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto flex-nowrap">
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 whitespace-nowrap">
                  You:{" "}
                  {playerRole === "designer"
                    ? "🎨 Designer"
                    : "💬 Client"}
                </span>
                {opponentRole && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30 whitespace-nowrap">
                    vs{" "}
                    {opponentRole === "designer"
                      ? "🎨 Designer"
                      : "💬 Client"}
                  </span>
                )}
                {!opponentRole && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30 animate-pulse whitespace-nowrap">
                    Waiting...
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {!isPracticeMode && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] rounded border border-[#3d3d3d]">
                <span className="text-xs text-gray-400">
                  Game ID:
                </span>
                <code className="text-xs text-white font-mono">
                  {gameId}
                </code>
                <button
                  onClick={copyGameId}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy Game ID"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

            {/* Focus Mode Toggle - Show on medium+ screens */}
            <Button
              onClick={() => setFocusMode(!focusMode)}
              variant="outline"
              size="sm"
              className="hidden md:flex bg-[#1e1e1e] border-[#3d3d3d] text-white hover:bg-[#3d3d3d]"
              title={focusMode ? "Show Panels" : "Focus Mode"}
            >
              {focusMode ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Show Panels
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Focus
                </>
              )}
            </Button>

            <Button
              onClick={handleUndo}
              disabled={undoUsed || !previousGameState}
              variant="outline"
              size="sm"
              className="bg-[#1e1e1e] border-[#3d3d3d] text-white hover:bg-[#3d3d3d] hidden md:flex"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo {undoUsed ? "(Used)" : ""}
            </Button>
            
            {/* Mobile compact button */}
            <Button
              onClick={handleUndo}
              disabled={undoUsed || !previousGameState}
              variant="outline"
              size="sm"
              className="bg-[#1e1e1e] border-[#3d3d3d] text-white hover:bg-[#3d3d3d] md:hidden p-2"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="bg-[#1e1e1e] border-[#3d3d3d] text-white hover:bg-[#3d3d3d] hidden md:inline-flex"
            >
              New Game
            </Button>
            
            {/* Mobile compact button */}
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="bg-[#1e1e1e] border-[#3d3d3d] text-white hover:bg-[#3d3d3d] md:hidden px-3 text-xs"
            >
              New
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 md:p-8 overflow-auto min-h-0 relative">
          <div className="w-full h-full flex items-center justify-center">
            <PoolTable
              balls={balls}
              onBallsUpdate={handleBallsUpdate}
              onTurnComplete={handleTurnComplete}
              canShoot={isMyTurn}
              currentPlayer={currentPlayer}
              opponentRole={opponentRole}
              onShotStart={handleShotStart}
              isPracticeMode={isPracticeMode}
            />
          </div>
          
          {/* Floating Focus Mode Button when in focus mode */}
          {focusMode && (
            <Button
              onClick={() => setFocusMode(false)}
              size="sm"
              className="absolute bottom-4 right-4 bg-[#F8E4C9] hover:bg-[#ede3d0] text-[#443018] font-semibold shadow-lg border-2 border-[#443018]/20"
              title="Show Panels"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Focus
            </Button>
          )}
        </div>
      </div>

      {/* Hide properties panel on small screens or in focus mode */}
      {!focusMode && (
        <div className="hidden lg:block">
          <PropertiesPanel
            balls={balls}
            currentPlayer={currentPlayer}
            designerBallsSunk={designerBallsSunk}
            clientBallsSunk={clientBallsSunk}
            turnNumber={turnNumber}
            isPracticeMode={isPracticeMode}
          />
        </div>
      )}

      <GameOverModal
        isOpen={winner !== null}
        winner={winner}
        playerRole={playerRole}
        onRestart={handleRestart}
      />

      {showTipsModal && (
        <GameTipsModal
          onClose={() => setShowTipsModal(false)}
        />
      )}
    </div>
  );
}