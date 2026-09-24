import svgPaths from '../../imports/svg-7y3prp9a38';

interface GameTipsModalProps {
  onClose: () => void;
}

export function GameTipsModal({ onClose }: GameTipsModalProps) {
  return (
    <div className="fixed inset-0 bg-[#110A02]/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2c2c2c] content-stretch flex flex-col gap-[14px] items-start p-[33px] relative rounded-[10px] max-w-[526px] w-full border border-[#3d3d3d] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)]">
        
        {/* Main Content Container */}
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center py-[27px] relative shrink-0 w-full">
          
          {/* Title */}
          <p className="font-bold leading-[40px] not-italic relative shrink-0 text-[36px] text-center text-white tracking-[0.3691px] whitespace-pre-wrap">
            🎉 Welcome to Pixel Pool!
          </p>

          {/* Content Cards Container */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            
            {/* How to Win Card */}
            <div className="bg-[#2c2c2c] relative rounded-[10px] shrink-0 w-full border-2 border-[rgba(68,48,24,0.2)] px-[18px] py-[16px]">
              <div className="content-stretch flex flex-col gap-[16px] items-start relative w-full">
                <p className="font-bold leading-[24px] not-italic relative shrink-0 text-[16px] text-white tracking-[-0.3125px]">
                  How to Win
                </p>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                  <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    Clear all your colored balls (7 balls total)
                  </p>
                  <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    Sink the 8-ball to win the game
                  </p>
                  <p className="font-bold leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    Don't sink the 8-ball early - you'll lose instantly!
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Tips Card */}
            <div className="bg-[#2c2c2c] relative rounded-[10px] shrink-0 w-full border-2 border-[rgba(68,48,24,0.2)] px-[18px] py-[16px]">
              <div className="content-stretch flex flex-col gap-[16px] items-start relative w-full">
                <p className="font-bold leading-[24px] not-italic relative shrink-0 text-[16px] text-white tracking-[-0.3125px]">
                  Pro Tips
                </p>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                  <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    💡 Aim for center pocket shots - they're more forgiving
                  </p>
                  <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    💡 Plan 2-3 shots ahead like a <span className="font-bold">design system</span>
                  </p>
                  <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    💡 Control your shot power - soft is often better
                  </p>
                  <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#f8e4c9] text-[14px] tracking-[-0.1504px]">
                    💡 The 8-ball is your final deliverable - <span className="font-bold">Save it!</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Let's Play Button */}
        <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
          <button
            onClick={onClose}
            className="bg-[#f8e4c9] hover:bg-[#ede3d0] h-[48px] relative rounded-[8px] shrink-0 w-full transition-colors"
          >
            <div className="absolute content-stretch flex items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <p className="font-semibold leading-[24px] not-italic text-[#110a02] text-[16px] text-center tracking-[-0.3125px] whitespace-nowrap">
                Let's Play! 🎱
              </p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}