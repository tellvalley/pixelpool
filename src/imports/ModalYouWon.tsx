import svgPaths from "./svg-sd4swgc79l";
import imgGroup91 from "figma:asset/f69bd5e2bc4e420bffd64c7a4177c23cacc5c038.png";

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center justify-center not-italic py-[27px] relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="Container">
      <div className="font-['Inter:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[36px] text-white tracking-[0.3691px] w-[325px]">
        <p className="mb-0">🎉 You Won!</p>
        <p>Project Approved!</p>
      </div>
      <ul className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] list-disc relative shrink-0 text-[#99a1af] text-[14px] tracking-[-0.1504px] whitespace-nowrap">
        <li className="mb-0 ms-[21px]">
          <span className="leading-[20px]">Your layers were perfectly named.</span>
        </li>
        <li className="mb-0 ms-[21px]">
          <span className="leading-[20px]">Your components were organized.</span>
        </li>
        <li className="ms-[21px]">
          <span className="leading-[20px]">{`The client has no notes. You're a design legend!`}</span>
        </li>
      </ul>
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[242px] relative shrink-0 w-full">
      <div className="-translate-x-1/2 absolute h-[242px] left-[calc(50%+1px)] top-0 w-[267px]" data-name="Group 9 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGroup91} />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[0.86px] size-[16px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p12949080} id="Vector" stroke="var(--stroke-0, #443018)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 2V5.33333H5.33333" id="Vector_2" stroke="var(--stroke-0, #443018)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Y() {
  return (
    <div className="h-[16px] opacity-80 relative shrink-0 w-[17px]" data-name="$y">
      <Icon />
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[20px] relative shrink-0 w-[73px]">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] left-[36.5px] not-italic text-[#443018] text-[14px] text-center top-0 tracking-[-0.1504px]">New Game</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[10px] items-center left-[calc(50%+0.5px)] top-[14.5px]">
      <Y />
      <Frame />
    </div>
  );
}

function Lt() {
  return (
    <div className="bg-[#f8e4c9] h-[48px] relative rounded-[8px] shrink-0 w-full" data-name="Lt">
      <Frame1 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col h-[112px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Lt />
    </div>
  );
}

export default function ModalYouWon() {
  return (
    <div className="bg-[#2c2c2c] content-stretch flex flex-col gap-[14px] items-start p-[33px] relative rounded-[10px] size-full" data-name="Modal - You Won">
      <div aria-hidden="true" className="absolute border border-[#3d3d3d] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)]" />
      <Container />
      <Frame2 />
      <Container1 />
    </div>
  );
}