import { Logo } from "./logo";

export function LogoLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 bg-white">
      <div className="relative h-20 w-20">
        <div className="absolute -inset-2 rounded-[1.5rem] border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
        <Logo className="h-20 w-20 rounded-2xl shadow-xl" />
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-400">
        <span>MedConnectMe</span>
        <span className="flex gap-0.5" aria-hidden>
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce" />
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.12s]" />
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.24s]" />
        </span>
      </div>
    </div>
  );
}
