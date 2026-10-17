import type { Illustration } from "@/features/welcome/illustrations/undraw";

/**
 * "Cuéntanos de ti" (CU-17): una tarjeta de perfil (avatar, nombre y tres opciones, la elegida en el color de la
 * pantalla) con alguien que saluda al lado y una planta. Dibujada para Senda en el estilo de unDraw (mismos grises
 * y piel; el acento es var(--illu-accent)), para que combine con las otras cuatro.
 */
export const PROFILE_CARD: Illustration = {
  viewBox: "0 0 820 620",
  markup: [
    // Suelo
    '<path d="M40 596h740" stroke="#e6e6e6" stroke-width="3" stroke-linecap="round"/>',
    // Planta
    '<path d="M118 596h68l-8-70h-52z" fill="#3f3d56"/>',
    '<path d="M152 528c-6-60 10-110 46-150-4 54-18 104-46 150z" fill="var(--illu-accent)"/>',
    '<path d="M150 528c-30-40-44-86-36-132 26 40 38 84 36 132z" fill="#3f3d56"/>',
    '<path d="M156 530c26-30 54-46 92-50-22 30-52 46-92 50z" fill="var(--illu-accent)" opacity="0.7"/>',
    // Tarjeta (con su sombra plana)
    '<rect x="226" y="96" width="400" height="440" rx="30" fill="#f2f2f2"/>',
    '<rect x="208" y="78" width="400" height="440" rx="30" fill="#fff" stroke="#e6e6e6" stroke-width="3"/>',
    // Avatar
    '<circle cx="408" cy="188" r="64" fill="var(--illu-accent)" opacity="0.16"/>',
    '<clipPath id="pc-avatar"><circle cx="408" cy="188" r="64"/></clipPath>',
    '<g clip-path="url(#pc-avatar)">',
    '<path d="M346 262c6-40 30-62 62-62s56 22 62 62z" fill="var(--illu-accent)"/>',
    '<circle cx="408" cy="172" r="28" fill="#ffb8b8"/>',
    '<path d="M380 168c-2-24 12-38 30-38 20 0 32 14 30 34-8-12-22-16-34-14-12 2-20 8-26 18z" fill="#2f2e41"/>',
    "</g>",
    // Nombre y detalle
    '<rect x="298" y="282" width="220" height="18" rx="9" fill="#3f3d56"/>',
    '<rect x="328" y="314" width="160" height="12" rx="6" fill="#e6e6e6"/>',
    // Tres opciones, la del medio elegida
    '<rect x="244" y="352" width="100" height="42" rx="21" fill="#f2f2f2"/>',
    '<rect x="358" y="352" width="100" height="42" rx="21" fill="var(--illu-accent)"/>',
    '<path d="M394 373l9 9 18-18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    '<rect x="472" y="352" width="100" height="42" rx="21" fill="#f2f2f2"/>',
    // Botón
    '<rect x="268" y="430" width="280" height="48" rx="24" fill="var(--illu-accent)"/>',
    '<rect x="352" y="449" width="112" height="10" rx="5" fill="#fff" opacity="0.85"/>',
    // Corazón y destellos
    '<path d="M588 84c0-16 22-20 26-4 4-16 26-12 26 4 0 20-26 32-26 32s-26-12-26-32z" fill="var(--illu-accent-2)"/>',
    '<path d="M168 150l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="var(--illu-accent)" opacity="0.6"/>',
    '<path d="M660 230l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#3f3d56" opacity="0.5"/>',
    // Persona que saluda
    '<path d="M676 590v-120h22v120z" fill="#2f2e41"/>',
    '<path d="M708 590v-120h22v120z" fill="#2f2e41"/>',
    '<path d="M666 596c0-8 10-12 22-12s20 4 20 12z" fill="#3f3d56"/>',
    '<path d="M700 596c0-8 10-12 22-12s20 4 20 12z" fill="#3f3d56"/>',
    '<path d="M664 480c-4-60 6-104 38-118 32 14 42 58 38 118z" fill="var(--illu-accent)"/>',
    '<path d="M736 380c18-10 30-32 32-62" stroke="#ffb8b8" stroke-width="14" fill="none" stroke-linecap="round"/>',
    '<path d="M732 392c10-6 16-12 20-22" stroke="var(--illu-accent)" stroke-width="22" fill="none" stroke-linecap="round"/>',
    '<path d="M668 400c-10 26-10 52 0 74" stroke="#ffb8b8" stroke-width="13" fill="none" stroke-linecap="round"/>',
    '<path d="M694 344h16v22h-16z" fill="#ffb8b8"/>',
    '<circle cx="702" cy="322" r="26" fill="#ffb8b8"/>',
    '<path d="M676 318c-2-22 12-34 28-34 18 0 30 12 28 32-6-10-18-14-28-12-10 2-20 6-28 14z" fill="#2f2e41"/>',
    '<circle cx="768" cy="310" r="10" fill="#ffb8b8"/>',
  ].join(""),
};
