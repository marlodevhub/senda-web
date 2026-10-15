/** Árbol redondo de las colinas. */
function Tree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <rect x={x - r * 0.12} y={y} width={r * 0.24} height={r * 0.9} rx={r * 0.1} fill="var(--sl-trunk)" />
      <circle cx={x} cy={y} r={r} fill="var(--sl-tree)" />
    </g>
  );
}

/** Caminante visto de lejos: cabeza, cuerpo y piernas. */
function Walker({ x, y, color, step }: { x: number; y: number; color: string; step: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 40} rx={14} ry={4} fill="var(--sl-shadow)" />
      <path
        d={`M${x - 4} ${y + 20} L${x - 4 - step} ${y + 38} M${x + 4} ${y + 20} L${x + 4 + step} ${y + 38}`}
        stroke="var(--sl-ink)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <rect x={x - 9} y={y - 6} width={18} height={30} rx={9} fill={color} />
      <circle cx={x} cy={y - 16} r={8.5} fill="var(--sl-skin)" />
    </g>
  );
}

/**
 * Fondo de las pantallas de entrada: un amanecer sobre montañas y colinas, con
 * un camino —la senda— que baja desde el horizonte y dos personas que lo
 * recorren juntas. Ocupa toda la pantalla, anclado abajo a la derecha: en
 * escritorio se ve entero; en móvil queda a la vista el camino. Decorativo.
 */
export function SendaLandscape() {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute right-0 bottom-0 h-full w-full"
    >
      <defs>
        <linearGradient id="senda-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sl-sky-top)" />
          <stop offset="0.45" stopColor="var(--sl-sky-mid)" />
          <stop offset="0.7" stopColor="var(--sl-sky-low)" />
        </linearGradient>
        <radialGradient id="senda-glow">
          <stop offset="0" stopColor="var(--sl-sun)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--sl-sun)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="senda-path" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sl-path-far)" />
          <stop offset="1" stopColor="var(--sl-path)" />
        </linearGradient>
      </defs>

      <rect width="1600" height="1000" fill="url(#senda-sky)" />

      {/* Sol (luna en modo oscuro) y aves */}
      <circle cx="1180" cy="450" r="300" fill="url(#senda-glow)" />
      <circle className="senda-sun" cx="1180" cy="450" r="110" fill="var(--sl-sun)" />
      <g className="auth-float" stroke="var(--sl-bird)" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M900 330 q 13 -12 26 0 q 13 -12 26 0" />
        <path d="M975 295 q 9 -9 18 0 q 9 -9 18 0" />
        <path d="M1400 330 q 11 -10 22 0 q 11 -10 22 0" />
      </g>

      {/* Montañas lejanas y cordillera media */}
      <path
        d="M0 560 L130 470 L230 515 L370 400 L480 480 L610 380 L730 470 L860 405 L990 500 L1110 430 L1250 500 L1390 395 L1510 470 L1600 430 L1600 1000 L0 1000 Z"
        fill="var(--sl-far)"
        strokeLinejoin="round"
      />
      <path
        d="M0 640 C 150 590, 260 560, 400 585 C 540 610, 640 540, 800 545 C 960 550, 1040 600, 1180 590 C 1320 580, 1440 530, 1600 560 L1600 1000 L0 1000 Z"
        fill="var(--sl-mid)"
      />

      {/* Colinas */}
      <path
        d="M0 700 C 240 640, 420 665, 640 652 C 860 640, 1000 600, 1180 612 C 1360 624, 1480 652, 1600 640 L1600 1000 L0 1000 Z"
        fill="var(--sl-hill-1)"
      />
      <Tree x={300} y={672} r={20} />
      <Tree x={345} y={680} r={14} />
      <Tree x={880} y={640} r={18} />
      <Tree x={1450} y={650} r={18} />
      <Tree x={1490} y={658} r={12} />
      <path
        d="M0 810 C 260 745, 520 765, 760 735 C 980 708, 1110 700, 1210 712 L1600 712 L1600 1000 L0 1000 Z"
        fill="var(--sl-hill-2)"
      />

      {/* La senda: baja del horizonte, junto al sol, y se ensancha hacia quien mira */}
      <path
        d="M1172 612 C 1150 650, 1235 690, 1205 745 C 1160 830, 1080 900, 1150 1000 L1500 1000 C 1390 905, 1335 840, 1345 775 C 1352 720, 1210 670, 1184 612 Z"
        fill="url(#senda-path)"
      />
      <g fill="var(--sl-stone)">
        <ellipse cx="1190" cy="700" rx="7" ry="3" />
        <ellipse cx="1300" cy="760" rx="9" ry="4" />
        <ellipse cx="1160" cy="880" rx="12" ry="5" />
        <ellipse cx="1380" cy="930" rx="14" ry="6" />
      </g>

      <Walker x={1236} y={770} color="var(--sl-walker-a)" step={6} />
      <Walker x={1272} y={762} color="var(--sl-walker-b)" step={-5} />

      {/* Primer plano: colina a la izquierda con flores y un montículo a la derecha */}
      <path d="M0 900 C 300 830, 700 850, 960 885 C 1060 900, 1115 940, 1130 1000 L0 1000 Z" fill="var(--sl-hill-3)" />
      <path d="M1530 1000 C 1545 950, 1570 925, 1600 915 L1600 1000 Z" fill="var(--sl-hill-3)" />
      <g fill="var(--sl-flower)">
        <circle cx="820" cy="900" r="6" />
        <circle cx="860" cy="912" r="5" />
        <circle cx="905" cy="903" r="6" />
        <circle cx="990" cy="930" r="5" />
        <circle cx="1040" cy="948" r="6" />
      </g>
      <g fill="var(--sl-flower-alt)">
        <circle cx="840" cy="922" r="4" />
        <circle cx="950" cy="920" r="4" />
        <circle cx="1015" cy="962" r="4" />
      </g>
    </svg>
  );
}
