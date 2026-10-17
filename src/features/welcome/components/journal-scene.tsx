import type { CSSProperties } from "react";

/** Los colores del paisaje de una pantalla de la bienvenida (los mismos tonos que esa pantalla en móvil). */
export type ScenePalette = {
  sky: string;
  far: string;
  near: string;
  ground: string;
  leaf: string;
  /** La ropa de quien escribe en primer plano. */
  accent: string;
  /** La ropa de quien mira su celular al fondo. */
  accent2: string;
};

const SKIN = "#E3A97F";
const SKIN_SHADE = "#CF9068";
const HAIR = "#3B2A3A";
const PANTS = "#2B2F4A";
const SHOE = "#231E2B";
const TRUNK = "#8A5A3B";

/**
 * Bienvenida en escritorio (CU-17): un diario en un paisaje. En primer plano, alguien sentado en el pasto escribe en
 * su laptop, con su diario abierto al lado; al fondo, otra persona mira su celular. Ilustración plana dibujada aquí
 * (no imágenes generadas). Los colores salen de variables CSS: al pasar de pantalla, el paisaje cambia por completo de
 * color con una transición (`.welcome-scene` en globals.css). Decorativa.
 */
export function JournalScene({ palette, className }: { palette: ScenePalette; className?: string }) {
  const vars = {
    "--sky": palette.sky,
    "--far": palette.far,
    "--near": palette.near,
    "--ground": palette.ground,
    "--leaf": palette.leaf,
    "--accent": palette.accent,
    "--accent2": palette.accent2,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 900 700"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      focusable="false"
      className={`welcome-scene ${className ?? ""}`}
      style={vars}
    >
      {/* Cielo, sol y nubes */}
      <rect width="900" height="700" fill="var(--sky)" />
      <circle cx="700" cy="150" r="78" fill="#fff" opacity="0.45" />
      <circle cx="700" cy="150" r="52" fill="#fff" opacity="0.85" />
      <g className="welcome-scene-float" fill="#fff" opacity="0.9">
        <circle cx="180" cy="150" r="30" />
        <circle cx="215" cy="138" r="38" />
        <circle cx="255" cy="152" r="28" />
        <rect x="160" y="150" width="120" height="30" rx="15" />
      </g>
      <g className="welcome-scene-float welcome-scene-float-slow" fill="#fff" opacity="0.75">
        <circle cx="500" cy="96" r="22" />
        <circle cx="528" cy="86" r="30" />
        <circle cx="560" cy="98" r="20" />
        <rect x="484" y="96" width="94" height="22" rx="11" />
      </g>

      {/* Colinas */}
      <path d="M0 430 C150 360 300 380 420 410 C560 445 700 360 900 380 L900 700 L0 700 Z" fill="var(--far)" />
      <path d="M0 505 C180 445 330 470 470 500 C620 532 760 470 900 485 L900 700 L0 700 Z" fill="var(--near)" />

      {/* Árboles al fondo */}
      <rect x="124" y="372" width="12" height="54" rx="4" fill={TRUNK} />
      <g fill="var(--leaf)">
        <circle cx="130" cy="352" r="38" />
        <circle cx="106" cy="378" r="26" />
        <circle cx="156" cy="380" r="24" />
      </g>
      <rect x="826" y="356" width="10" height="44" rx="4" fill={TRUNK} />
      <g fill="var(--leaf)">
        <circle cx="831" cy="340" r="30" />
        <circle cx="812" cy="360" r="20" />
        <circle cx="850" cy="362" r="19" />
      </g>

      {/* Al fondo: alguien mira su celular */}
      <g transform="translate(628 316) scale(0.95)">
        <path d="M48 120 L44 190 M66 120 L70 190" stroke={PANTS} strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="42" cy="193" rx="11" ry="5" fill={SHOE} />
        <ellipse cx="74" cy="193" rx="11" ry="5" fill={SHOE} />
        <path d="M34 62 Q57 50 80 62 L84 126 Q57 134 30 126 Z" fill="var(--accent2)" />
        <path d="M38 72 L32 116" stroke={SKIN} strokeWidth="10" strokeLinecap="round" />
        <path d="M38 66 L35 84" stroke="var(--accent2)" strokeWidth="14" strokeLinecap="round" />
        <rect x="51" y="40" width="12" height="16" rx="4" fill={SKIN_SHADE} />
        <circle cx="57" cy="30" r="20" fill={SKIN} />
        <path d="M37 28 Q38 6 58 8 Q78 8 78 28 Q70 18 58 20 Q46 18 37 28 Z" fill={HAIR} />
        <circle cx="68" cy="32" r="2.2" fill={SHOE} />
        <path
          d="M78 70 L94 94 L86 60"
          stroke={SKIN}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M77 66 L85 82" stroke="var(--accent2)" strokeWidth="14" strokeLinecap="round" />
        <rect x="78" y="38" width="15" height="25" rx="3.5" fill={SHOE} />
        <rect x="80" y="41" width="11" height="18" rx="2" fill="#CFEFFF" />
        <path
          className="welcome-scene-float"
          d="M104 18 C104 12 112 11 113 17 C114 11 122 12 122 18 C122 25 113 29 113 29 C113 29 104 25 104 18 Z"
          fill="#fff"
          opacity="0.9"
        />
      </g>

      {/* Pasto en primer plano */}
      <path d="M0 592 C200 560 450 578 900 560 L900 700 L0 700 Z" fill="var(--ground)" />
      <ellipse cx="380" cy="640" rx="230" ry="34" fill="#fff" opacity="0.28" />

      {/* El diario abierto, la lapicera y una taza */}
      <g transform="translate(150 598)">
        <path d="M-6 26 L58 8 L124 22 L118 52 L58 42 L0 56 Z" fill="var(--leaf)" />
        <path d="M0 22 L58 6 L60 38 L4 50 Z" fill="#fff" />
        <path d="M60 6 L118 18 L114 46 L60 38 Z" fill="#FBF8F1" />
        <g stroke="#D6D2C8" strokeWidth="2" strokeLinecap="round">
          <path d="M10 28 L50 18 M12 36 L52 26 M14 44 L44 37" />
          <path d="M68 16 L108 24 M68 24 L106 32 M68 32 L96 37" />
        </g>
        <rect x="70" y="0" width="54" height="7" rx="3.5" transform="rotate(14 70 0)" fill="var(--accent)" />
      </g>
      <g transform="translate(96 612)">
        <rect x="0" y="0" width="30" height="34" rx="6" fill="#fff" />
        <path d="M30 8 Q42 10 40 20 Q38 28 30 26" stroke="#fff" strokeWidth="5" fill="none" />
        <path
          className="welcome-scene-float"
          d="M10 -8 Q4 -16 10 -24 M20 -8 Q14 -16 20 -24"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* En primer plano: alguien escribe en su laptop, sentado en el pasto */}
      <g transform="translate(270 404) scale(1.15)">
        <path
          d="M70 208 L150 186 L206 226"
          stroke={PANTS}
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="214" cy="229" rx="17" ry="9" fill={SHOE} />
        <path d="M40 212 Q28 140 62 104 Q88 92 108 110 Q124 150 106 214 Z" fill="var(--accent)" />
        <rect x="78" y="78" width="16" height="24" rx="5" fill={SKIN_SHADE} />
        <circle cx="88" cy="62" r="30" fill={SKIN} />
        <path d="M58 62 Q55 26 90 28 Q120 30 118 62 Q106 44 88 46 Q70 46 58 62 Z" fill={HAIR} />
        <circle cx="66" cy="30" r="14" fill={HAIR} />
        <circle cx="104" cy="64" r="2.8" fill={SHOE} />
        <circle cx="106" cy="76" r="6" fill="#F29C9C" opacity="0.55" />
        <path d="M100 86 Q106 89 111 85" stroke={SHOE} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* La laptop sobre las piernas */}
        <path d="M110 184 L198 166 L202 175 L114 193 Z" fill="#DDE1EA" />
        <path d="M178 170 L208 102 L219 106 L189 173 Z" fill="#3A3F5C" />
        <circle cx="199" cy="138" r="4" fill="#fff" opacity="0.5" />
        {/* El brazo hacia el teclado */}
        <path
          d="M98 118 L126 158 L164 174"
          stroke={SKIN}
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M96 114 L112 140" stroke="var(--accent)" strokeWidth="20" strokeLinecap="round" />
      </g>

      {/* Plantas y flores al frente */}
      <g fill="var(--leaf)">
        <ellipse cx="40" cy="676" rx="70" ry="44" />
        <ellipse cx="840" cy="672" rx="90" ry="48" />
        <ellipse cx="22" cy="640" rx="12" ry="34" transform="rotate(-18 22 640)" />
        <ellipse cx="62" cy="632" rx="11" ry="36" transform="rotate(14 62 632)" />
        <ellipse cx="812" cy="626" rx="12" ry="38" transform="rotate(-14 812 626)" />
        <ellipse cx="866" cy="624" rx="11" ry="36" transform="rotate(16 866 624)" />
      </g>
      <g fill="var(--near)">
        <ellipse cx="90" cy="690" rx="56" ry="30" />
        <ellipse cx="770" cy="692" rx="60" ry="30" />
      </g>
      <g fill="#fff">
        <circle cx="70" cy="612" r="7" />
        <circle cx="804" cy="606" r="7" />
        <circle cx="874" cy="612" r="6" />
      </g>
      <g fill="var(--accent)">
        <circle cx="70" cy="612" r="3" />
        <circle cx="804" cy="606" r="3" />
        <circle cx="874" cy="612" r="2.5" />
      </g>

      {/* Destellos */}
      <g fill="#fff" className="welcome-scene-twinkle">
        <path d="M600 250 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 z" />
        <path d="M380 210 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" />
        <path d="M790 250 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" />
      </g>
    </svg>
  );
}
