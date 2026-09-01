import "./Logo.css";

function Logo({ size = 64 }) {
  return (
    <div
      className="logo"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <defs>

          <radialGradient
            id="sphereGradient"
            cx="35%"
            cy="28%"
            r="80%"
          >
            <stop offset="0%" stopColor="#E8D5FF" />
            <stop offset="30%" stopColor="#B47AFF" />
            <stop offset="70%" stopColor="#7D3DF3" />
            <stop offset="100%" stopColor="#4D1FB8" />
          </radialGradient>

          <filter
            id="glow"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur
              stdDeviation="5"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

        </defs>

        {/* Gömb */}
        <circle
          className="logo-sphere"
          cx="60"
          cy="60"
          r="24"
          fill="url(#sphereGradient)"
          filter="url(#glow)"
        />

        {/* Fő fényfolt */}
        <ellipse
          cx="52"
          cy="50"
          rx="6"
          ry="4"
          fill="white"
          opacity=".28"
          transform="rotate(-25 52 50)"
        />

        {/* Kis reflex */}
        <ellipse
          cx="48"
          cy="43"
          rx="2.8"
          ry="2"
          fill="white"
          opacity=".55"
          transform="rotate(-25 48 43)"
        />

        {/* Orbit */}
        <g className="orbit-group">

          <path
            d="M35 28 A40 40 0 0 1 92 45"
            fill="none"
            stroke="#B68CFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          <path
            d="M86 92 A40 40 0 0 1 28 76"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          <circle
            className="orbit-dot"
            cx="92"
            cy="43"
            r="5.5"
            fill="#C8A7FF"
          />

          <circle
            className="orbit-dot"
            cx="28"
            cy="75"
            r="5.5"
            fill="#A78BFA"
          />

          <circle
            className="orbit-dot"
            cx="89"
            cy="89"
            r="5.5"
            fill="#B68CFF"
          />

        </g>

      </svg>
    </div>
  );
}

export default Logo;