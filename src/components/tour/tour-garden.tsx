/**
 * Paso "Mira tu Progreso" del tutorial: un jardín panorámico pequeño (cielo, árboles lejanos, colina con flores y
 * brotes), dibujado con los mismos colores del Jardín de Progreso (`garden-tokens`, también en modo oscuro). La
 * emoción del paso va encima, parada en la colina. Decorativo.
 */
export function TourGarden({ children }: { children: React.ReactNode }) {
  return (
    <div className="garden-scene garden-tokens relative h-36 overflow-hidden">
      <svg
        viewBox="0 0 400 144"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="tour-garden-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--garden-hill-top)" />
            <stop offset="1" stopColor="var(--garden-hill-mid)" />
          </linearGradient>
          <radialGradient id="tour-garden-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--garden-glow)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--garden-glow)" stopOpacity="0" />
          </radialGradient>
          <filter id="tour-garden-far">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* Sol y nubes */}
        <circle cx="330" cy="34" r="16" fill="var(--garden-sun)" opacity="0.85" />
        <g fill="var(--garden-cloud)" opacity="0.85">
          <ellipse cx="78" cy="30" rx="26" ry="9" />
          <ellipse cx="96" cy="24" rx="16" ry="9" />
          <ellipse cx="250" cy="22" rx="20" ry="7" />
        </g>

        {/* Árboles lejanos a los lados */}
        <g filter="url(#tour-garden-far)" opacity="0.8" fill="var(--garden-far-tree)">
          <circle cx="18" cy="96" r="24" />
          <circle cx="52" cy="104" r="17" />
          <circle cx="352" cy="98" r="20" />
          <circle cx="388" cy="92" r="26" />
        </g>

        {/* Colina panorámica */}
        <path
          d="M-10 132 C 90 128, 130 92, 200 92 C 270 92, 310 128, 410 132 L 410 144 L -10 144 Z"
          fill="url(#tour-garden-hill)"
        />
        <ellipse cx="200" cy="106" rx="110" ry="22" fill="url(#tour-garden-glow)" />

        {/* Flores y brotes sobre la colina */}
        <Flower x={96} y={122} color="var(--bloom)" />
        <Flower x={128} y={110} color="var(--garden-sun)" />
        <Flower x={276} y={110} color="var(--flow)" />
        <Flower x={312} y={122} color="var(--bloom)" />
        <Sprout x={150} y={104} />
        <Sprout x={252} y={104} />
        <Sprout x={70} y={130} />
        <Sprout x={338} y={130} />
      </svg>
      <div className="relative flex h-full items-end justify-center pb-5">{children}</div>
    </div>
  );
}

function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${y} v-12`} stroke="var(--garden-leaf)" strokeWidth="2" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <circle
          key={angle}
          cx={x + 4.5 * Math.cos((angle * Math.PI) / 180)}
          cy={y - 14 + 4.5 * Math.sin((angle * Math.PI) / 180)}
          r="3.6"
          fill={color}
        />
      ))}
      <circle cx={x} cy={y - 14} r="2.4" fill="var(--garden-sun)" />
    </g>
  );
}

function Sprout({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="var(--garden-leaf)" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d={`M${x} ${y} v-7`} />
      <path d={`M${x} ${y - 5} q -5 -3 -7 -1`} />
      <path d={`M${x} ${y - 6} q 5 -3 7 -1`} />
    </g>
  );
}
