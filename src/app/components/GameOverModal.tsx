import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import svgPaths from '../../imports/svg-sd4swgc79l';
import imgGroup91 from 'figma:asset/f69bd5e2bc4e420bffd64c7a4177c23cacc5c038.png';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'designer' | 'client' | 'foul' | null;
  playerRole: 'designer' | 'client' | null;
  onRestart: () => void;
}

function RestartIcon() {
  return (
    <div className="h-[16px] opacity-80 relative shrink-0 w-[17px]">
      <div className="absolute left-[0.86px] size-[16px] top-0">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g>
            <path d={svgPaths.p12949080} stroke="var(--stroke-0, #443018)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            <path d="M2 2V5.33333H5.33333" stroke="var(--stroke-0, #443018)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function GameOverModal({ isOpen, winner, playerRole, onRestart }: GameOverModalProps) {
  // Determine if this player won or lost
  const didPlayerWin = winner === playerRole;
  
  // YOU WON - Designer Victory
  if (didPlayerWin && winner === 'designer') {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="bg-[#2c2c2c] border border-[#3d3d3d] rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] max-w-[526px] p-[33px]">
          <div className="flex flex-col gap-[14px]">
            {/* Title and Description */}
            <div className="flex flex-col gap-[20px] items-center justify-center py-[27px] text-center">
              <DialogTitle className="font-bold text-[36px] leading-[40px] text-white tracking-[0.3691px]">
                <p className="mb-0">🎉 You Won!</p>
                <p className="mb-0">Project Approved!</p>
              </DialogTitle>
              <DialogDescription className="list-disc text-[#99a1af] text-[14px] tracking-[-0.1504px] space-y-1">
                <li className="ms-[21px]">
                  <span className="leading-[20px]">Your layers were perfectly named.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">Your components were organized.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">The client has no notes. You're a design legend!</span>
                </li>
              </DialogDescription>
            </div>

            {/* Mascot Image */}
            <div className="h-[242px] relative w-full flex items-center justify-center">
              <img 
                alt="Pixel Master mascot celebrating" 
                className="max-w-[267px] max-h-[242px] object-contain" 
                src={imgGroup91} 
              />
            </div>

            {/* Button */}
            <div className="flex flex-col h-[112px] items-center justify-center">
              <Button
                onClick={onRestart}
                className="bg-[#f8e4c9] hover:bg-[#ede3d0] text-[#443018] font-semibold h-[48px] rounded-[8px] w-full flex items-center justify-center gap-[10px]"
              >
                <RestartIcon />
                <span className="text-[14px] tracking-[-0.1504px]">New Game</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // YOU WON - Client Victory
  if (didPlayerWin && winner === 'client') {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="bg-[#2c2c2c] border border-[#3d3d3d] rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] max-w-[526px] p-[33px]">
          <div className="flex flex-col gap-[14px]">
            {/* Title and Description */}
            <div className="flex flex-col gap-[20px] items-center justify-center py-[27px] text-center">
              <DialogTitle className="font-bold text-[36px] leading-[40px] text-white tracking-[0.3691px]">
                <p className="mb-0">🎉 You Won!</p>
                <p className="mb-0">Scope Creep Victory!</p>
              </DialogTitle>
              <DialogDescription className="list-disc text-[#99a1af] text-[14px] tracking-[-0.1504px] space-y-1">
                <li className="ms-[21px]">
                  <span className="leading-[20px]">You successfully added enough "just one more thing" requests.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">The designer quit.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">You win!</span>
                </li>
              </DialogDescription>
            </div>

            {/* Mascot Image */}
            <div className="h-[242px] relative w-full flex items-center justify-center">
              <img 
                alt="Pixel Master mascot celebrating" 
                className="max-w-[267px] max-h-[242px] object-contain" 
                src={imgGroup91} 
              />
            </div>

            {/* Button */}
            <div className="flex flex-col h-[112px] items-center justify-center">
              <Button
                onClick={onRestart}
                className="bg-[#f8e4c9] hover:bg-[#ede3d0] text-[#443018] font-semibold h-[48px] rounded-[8px] w-full flex items-center justify-center gap-[10px]"
              >
                <RestartIcon />
                <span className="text-[14px] tracking-[-0.1504px]">New Game</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // YOU LOST - Designer Lost
  if (!didPlayerWin && winner === 'client' && playerRole === 'designer') {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="bg-[#2c2c2c] border border-[#3d3d3d] rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] max-w-[526px] p-[33px]">
          <div className="flex flex-col gap-[14px]">
            {/* Feedback Notes at Top */}
            <div className="h-[150px] relative w-full">
              <div className="absolute left-0 right-0 bg-[rgba(0,0,0,0.2)] flex flex-col gap-[8px] p-[16px] rounded-[10px]">
                <div className="bg-[rgba(251,44,54,0.3)] h-[34px] rounded-[4px] border border-[rgba(251,44,54,0.5)] flex items-center px-[9px]">
                  <p className="text-[#ffc9c9] text-[12px] leading-[16px]">💬 "Can we make it pop?"</p>
                </div>
                <div className="bg-[rgba(251,44,54,0.3)] h-[34px] rounded-[4px] border border-[rgba(251,44,54,0.5)] flex items-center px-[9px]">
                  <p className="text-[#ffc9c9] text-[12px] leading-[16px]">💬 "My nephew uses Photoshop..."</p>
                </div>
                <div className="bg-[rgba(251,44,54,0.3)] h-[34px] rounded-[4px] border border-[rgba(251,44,54,0.5)] flex items-center px-[9px]">
                  <p className="text-[#ffc9c9] text-[12px] leading-[16px]">💬 "Just one more revision..."</p>
                </div>
              </div>
            </div>

            {/* Title and Description */}
            <div className="flex flex-col gap-[20px] items-center justify-center py-[27px] text-center">
              <DialogTitle className="font-bold text-[36px] leading-[40px] text-white tracking-[0.3691px]">
                <p className="mb-0">😢 You Lost!</p>
                <p className="mb-0">Project Abandoned!</p>
              </DialogTitle>
              <DialogDescription className="list-disc text-[#99a1af] text-[14px] tracking-[-0.1504px] space-y-1">
                <li className="ms-[21px]">
                  <span className="leading-[20px]">The client drowned you in feedback notes.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">The project spiralled into chaos.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">Time to update your portfolio.</span>
                </li>
              </DialogDescription>
            </div>

            {/* Button */}
            <div className="flex flex-col h-[112px] items-center justify-center">
              <Button
                onClick={onRestart}
                className="bg-[#f8e4c9] hover:bg-[#ede3d0] text-[#443018] font-semibold h-[48px] rounded-[8px] w-full flex items-center justify-center gap-[10px]"
              >
                <RestartIcon />
                <span className="text-[14px] tracking-[-0.1504px]">New Game</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // YOU LOST - Client Lost
  if (!didPlayerWin && winner === 'designer' && playerRole === 'client') {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="bg-[#2c2c2c] border border-[#3d3d3d] rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] max-w-[526px] p-[33px]">
          <div className="flex flex-col gap-[14px]">
            {/* Empty space for symmetry (like the won screen has the mascot) */}
            <div className="h-[150px] relative w-full flex items-center justify-center">
              <div className="text-6xl">❌</div>
            </div>

            {/* Title and Description */}
            <div className="flex flex-col gap-[20px] items-center justify-center py-[27px] text-center">
              <DialogTitle className="font-bold text-[36px] leading-[40px] text-white tracking-[0.3691px]">
                <p className="mb-0">😢 You Lost!</p>
                <p className="mb-0">Project Rejected!</p>
              </DialogTitle>
              <DialogDescription className="list-disc text-[#99a1af] text-[14px] tracking-[-0.1504px] space-y-1">
                <li className="ms-[21px]">
                  <span className="leading-[20px]">The designer cleared all their assets first.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">Your feedback notes couldn't keep up.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">Better luck next sprint!</span>
                </li>
              </DialogDescription>
            </div>

            {/* Button */}
            <div className="flex flex-col h-[112px] items-center justify-center">
              <Button
                onClick={onRestart}
                className="bg-[#f8e4c9] hover:bg-[#ede3d0] text-[#443018] font-semibold h-[48px] rounded-[8px] w-full flex items-center justify-center gap-[10px]"
              >
                <RestartIcon />
                <span className="text-[14px] tracking-[-0.1504px]">New Game</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // FOUL - Early 8-Ball
  if (winner === 'foul') {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="bg-[#2c2c2c] border border-[#3d3d3d] rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] max-w-[526px] p-[33px]">
          <div className="flex flex-col gap-[14px]">
            {/* Error Display */}
            <div className="h-[150px] relative w-full flex items-center justify-center">
              <div className="bg-[rgba(0,0,0,0.2)] rounded-[10px] p-8 text-center">
                <div className="text-4xl font-mono text-red-500 animate-pulse mb-2">404</div>
                <div className="text-xs text-gray-400 mb-1">File Not Found</div>
                <div className="text-xs text-gray-500">Reconnect to Internet...</div>
              </div>
            </div>

            {/* Title and Description */}
            <div className="flex flex-col gap-[20px] items-center justify-center py-[27px] text-center">
              <DialogTitle className="font-bold text-[36px] leading-[40px] text-white tracking-[0.3691px]">
                <p className="mb-0">⚠️ File Corrupted!</p>
              </DialogTitle>
              <DialogDescription className="list-disc text-[#99a1af] text-[14px] tracking-[-0.1504px] space-y-1">
                <li className="ms-[21px]">
                  <span className="leading-[20px]">You sank the 8-ball too early!</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">Final_Final_v2.fig is corrupted.</span>
                </li>
                <li className="ms-[21px]">
                  <span className="leading-[20px]">The project is lost forever.</span>
                </li>
              </DialogDescription>
            </div>

            {/* Button */}
            <div className="flex flex-col h-[112px] items-center justify-center">
              <Button
                onClick={onRestart}
                className="bg-[#f8e4c9] hover:bg-[#ede3d0] text-[#443018] font-semibold h-[48px] rounded-[8px] w-full flex items-center justify-center gap-[10px]"
              >
                <RestartIcon />
                <span className="text-[14px] tracking-[-0.1504px]">New Game</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}