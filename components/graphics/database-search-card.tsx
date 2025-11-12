import { ChevronRightIcon } from "lucide-react";
import "./helpers/globals.css";

const SearchIconLong = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-[calc(var(--padding)*1.5)] h-[calc(var(--padding)*1.5)] text-[var(--dark-grey)] opacity-70 flex-shrink-0"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 6 6" strokeWidth="2.5" />
  </svg>
);

const VectorDBSVG = () => (
  <svg 
    viewBox="0 0 252 252" 
    fill="none" 
    className="absolute top-0 inset-x-0 mx-auto w-[60%] h-[90px] opacity-30 z-0"
    style={{ filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.05)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.03))' }}
  >
    <path d="M126 251C195.036 251 251 226.376 251 196C251 165.624 195.036 141 126 141C56.9644 141 1 165.624 1 196C1 226.376 56.9644 251 126 251Z" fill="white"/>
    <path d="M126 71C56.9644 71 1 95.6243 1 126V196C1 165.624 56.9644 141 126 141C195.036 141 251 165.624 251 196V126C251 95.6243 195.036 71 126 71Z" fill="white"/>
    <path d="M126 1C56.9644 1 1 25.6243 1 56V126C1 95.6243 56.9644 71 126 71C195.036 71 251 95.6243 251 126V56C251 25.6243 195.036 1 126 1Z" fill="white"/>
    <path d="M251 126V56C251 25.6243 195.036 1 126 1C56.9644 1 1 25.6243 1 56V126M251 126C251 95.6243 195.036 71 126 71C56.9644 71 1 95.6243 1 126M251 126V196M1 126V196M251 196C251 226.376 195.036 251 126 251C56.9644 251 1 226.376 1 196M251 196C251 165.624 195.036 141 126 141C56.9644 141 1 165.624 1 196" stroke="var(--dark-grey)" strokeWidth="2"/>
  </svg>
);

export function DatabaseSearchCard() {
  return (
    <div className="h-fit pt-18 pb-10 flex items-center justify-center relative">
      <VectorDBSVG />
      <div className="bg-white border border-[var(--light-grey)] rounded-[var(--border-radius)] p-[var(--padding)] relative z-10"
      style={{
        boxShadow: "var(--shadow)",
        }}
      >
        
        <div className="flex items-center gap-[var(--gap)]">
          <SearchIconLong />
          <span className="styling-text overflow-hidden whitespace-nowrap text-ellipsis flex-1">
            What was our enterprise pricing before we pivoted to SMB?
          </span>
          <ChevronRightIcon className="w-[calc(var(--padding)*1.5)] h-[calc(var(--padding)*1.5)] text-[var(--light-grey)] flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

