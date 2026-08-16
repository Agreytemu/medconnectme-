import * as React from "react";

export type CharStatus = "idle" | "success" | "error" | "loading";

type Props = {
  activeField: string | null;
  isTyping: boolean;
  status: CharStatus;
  privacy: boolean;
};

const ORDER = [
  "fullName",
  "regNo",
  "email",
  "phone",
  "college",
  "year",
  "course",
  "password",
  "confirmPassword",
];

export function AuthCharacter({ activeField, isTyping, status, privacy }: Props) {
  const idx = activeField ? ORDER.indexOf(activeField) : -1;
  const focused = idx >= 0 && !privacy;

  const gazeX = focused ? (idx % 2 === 0 ? -2 : 2) : 0;
  const gazeY = focused ? Math.min(9, 3 + idx * 0.8) : 0;

  const headTilt =
    status === "error" ? -5 : status === "loading" ? 2 : focused ? 1.5 : 0;

  const mouthPath =
    status === "success"
      ? "M68 55 Q80 68 92 55"
      : status === "error"
        ? "M70 58 Q80 53 90 58"
        : focused
          ? "M71 56 Q80 61 89 56"
          : "M72 56 Q80 60 88 56";

  const browTilt = status === "error" ? 8 : 0;

  const leftArmStyle =
    privacy
      ? { transform: "translate(24px,-76px)" }
      : status === "success"
        ? { transform: "translate(-2px,-34px)" }
        : undefined;

  const rightArmStyle =
    privacy
      ? { transform: "translate(-24px,-76px)" }
      : status === "success"
        ? { transform: "translate(2px,-34px)" }
        : undefined;

  const rightArmClass =
    isTyping && focused && !privacy
      ? "char-write"
      : status === "loading"
        ? "char-think"
        : "";

  const pupilOpacity = privacy ? 0 : 1;

  return (
    <div className="relative select-none" aria-hidden>
      {status === "loading" && (
        <span className="pulse-soft absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20" />
      )}
      <svg
        viewBox="0 0 160 175"
        className="relative h-24 w-24 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* body */}
        <rect
          x="42"
          y="72"
          width="76"
          height="82"
          rx="28"
          fill="#ffffff"
          stroke="#10b981"
          strokeWidth="3"
        />
        {/* chest panel with ECG */}
        <rect
          x="60"
          y="104"
          width="40"
          height="24"
          rx="9"
          fill="#ecfdf5"
          stroke="#a7f3d0"
          strokeWidth="2"
        />
        <path
          className="hand-draw"
          d="M64 116 L72 116 L76 108 L81 124 L85 112 L89 116 L96 116"
          stroke="#10b981"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* head */}
        <g
          style={{
            transform: `rotate(${headTilt}deg)`,
            transformOrigin: "80px 42px",
            transition: "transform 0.35s ease",
          }}
        >
          <circle
            cx="80"
            cy="42"
            r="30"
            fill="#ffffff"
            stroke="#10b981"
            strokeWidth="3"
          />

          {/* eyebrows */}
          <g
            style={{
              transform: `rotate(${browTilt}deg)`,
              transformOrigin: "70px 28px",
              transition: "transform 0.3s ease",
            }}
          >
            <line x1="62" y1="29" x2="74" y2="29" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <g
            style={{
              transform: `rotate(${-browTilt}deg)`,
              transformOrigin: "90px 28px",
              transition: "transform 0.3s ease",
            }}
          >
            <line x1="86" y1="29" x2="98" y2="29" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* eyes */}
          <g className="char-blink">
            <g style={{ opacity: pupilOpacity, transition: "opacity 0.2s ease" }}>
              <circle cx="70" cy="40" r="4" fill="#0f172a" style={{ transform: `translate(${gazeX}px,${gazeY}px)`, transition: "transform 0.25s ease" }} />
              <circle cx="90" cy="40" r="4" fill="#0f172a" style={{ transform: `translate(${gazeX}px,${gazeY}px)`, transition: "transform 0.25s ease" }} />
            </g>
          </g>

          {/* mouth */}
          <path
            d={mouthPath}
            stroke="#475569"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            style={{ transition: "d 0.3s ease" }}
          />
        </g>

        {/* arms */}
        <g
          style={{
            ...leftArmStyle,
            transition: "transform 0.35s ease",
          }}
        >
          <path
            d="M52 92 Q44 106 46 118"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="46" cy="118" r="7" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
        </g>
        <g
          className={rightArmClass}
          style={{
            ...rightArmStyle,
            transition: "transform 0.35s ease",
          }}
        >
          <path
            d="M108 92 Q116 106 114 118"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="114" cy="118" r="7" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}
