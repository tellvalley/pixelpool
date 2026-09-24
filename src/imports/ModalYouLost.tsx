import svgPaths from "./svg-6o8yieh6pt";

function Container1() {
  return (
    <div className="bg-[rgba(251,44,54,0.3)] h-[34px] relative rounded-[4px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(251,44,54,0.5)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[9px] not-italic text-[#ffc9c9] text-[12px] top-[10px]">{`💬 "Can we make it pop?"`}</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[rgba(251,44,54,0.3)] h-[34px] relative rounded-[4px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(251,44,54,0.5)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[9px] not-italic text-[#ffc9c9] text-[12px] top-[10px]">{`💬 "My nephew uses Photoshop..."`}</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[rgba(251,44,54,0.3)] h-[34px] relative rounded-[4px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(251,44,54,0.5)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[9px] not-italic text-[#ffc9c9] text-[12px] top-[10px]">{`💬 "Just one more revision..."`}</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[118px] items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
      <Container3 />
    </div>
  );
}

function E() {
  return (
    <div className="-translate-x-1/2 absolute bg-[rgba(0,0,0,0.2)] content-stretch flex flex-col items-start left-1/2 overflow-clip p-[16px] rounded-[10px] top-0 w-[460px]" data-name="e_">
      <Container />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[150px] relative shrink-0 w-full">
      <E />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center justify-center not-italic py-[27px] relative shrink-0 text-center w-full whitespace-nowrap" data-name="Container">
      <div className="font-['Inter:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[36px] text-white tracking-[0.3691px]">
        <p className="mb-0">😢 You Lost!</p>
        <p>Project Abandoned !</p>
      </div>
      <ul className="block font-['Inter:Regular',sans-serif] font-normal leading-[0] list-disc relative shrink-0 text-[#99a1af] text-[14px] tracking-[-0.1504px] whitespace-pre-wrap">
        <li className="mb-0 ms-[21px]">
          <span className="leading-[20px]">The client drowned you in feedback notes.</span>
        </li>
        <li className="mb-0 ms-[21px]">
          <span className="leading-[20px]">The project spiralled into chaos.</span>
        </li>
        <li className="ms-[21px]">
          <span className="leading-[20px]">Time to update your portfolio.</span>
        </li>
      </ul>
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

function Container5() {
  return (
    <div className="content-stretch flex flex-col h-[112px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Lt />
    </div>
  );
}

export default function ModalYouLost() {
  return (
    <div className="bg-[#2c2c2c] content-stretch flex flex-col gap-[14px] items-start p-[33px] relative rounded-[10px] size-full" data-name="Modal - You Lost">
      <div aria-hidden="true" className="absolute border border-[#3d3d3d] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)]" />
      <Frame2 />
      <Container4 />
      <Container5 />
    </div>
  );
}