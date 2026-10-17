import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

/**
 * Botones con sensación de app nativa (Apple HIG y Material 3):
 * - Forma de cápsula y zona táctil de 44 px o más (HIG: 44 pt; Material: 48 dp) en los tamaños para tocar.
 * - Al tocar se hunde un poco y se oscurece (sin el resaltado gris del navegador ni la espera del doble toque).
 *   El hover solo existe con mouse (Tailwind 4 lo limita a `@media (hover: hover)`).
 * - Jerarquía nativa: sólido (`hero`, `default`) para la acción principal; tintado (`soft`, `outline`) para las
 *   secundarias, con fondo suave y sin borde, como los botones "tinted"/"gray" de iOS o "tonal" de Material; plano
 *   (`ghost`) para las terciarias, solo texto en el color del tema.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 touch-manipulation items-center justify-center rounded-full border border-transparent bg-clip-padding text-base font-semibold whitespace-nowrap outline-none select-none [-webkit-tap-highlight-color:transparent] transition-[transform,background-color,color,box-shadow,filter,opacity] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] active:brightness-95 disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-reduce:transition-none motion-reduce:active:scale-100 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Sólido con el color del tema. */
        default: "bg-primary text-primary-foreground shadow-sm hover:brightness-105",
        /* Tintado gris (iOS "gray"): secundaria neutra, translúcido para verse sobre blanco, gris o color. Sin borde. */
        outline: "bg-foreground/7 text-foreground hover:bg-foreground/11 aria-expanded:bg-foreground/11",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        /* Plano: solo texto en el color del tema; al tocar aparece su fondo suave. */
        ghost: "text-bloom-ink hover:bg-bloom-tint active:bg-bloom-tint aria-expanded:bg-bloom-tint",
        /* Tintado rojo: la acción se lee peligrosa sin gritar (Retirarme, Eliminar). */
        destructive:
          "bg-destructive/12 text-[#A3352A] hover:bg-destructive/18 focus-visible:ring-destructive/25 dark:bg-destructive/20 dark:text-destructive dark:hover:bg-destructive/30",
        link: "h-auto rounded-md px-0 text-bloom-ink underline-offset-4 hover:underline active:scale-100",
        /* Senda — acción principal del día (Escribir, Reescribir): sólido con el degradado del tema. */
        hero: "btn-hero border-0 text-white shadow-bloom",
        /* Senda — tintado cálido (Ver mi progreso, Leer una frase). */
        soft: "bg-accent text-accent-foreground hover:bg-[color-mix(in_oklch,var(--accent),var(--foreground)_6%)]",
        /* Senda — borde degradado, para acciones opcionales que aún se sienten especiales (Guardar en el frasco). */
        "gradient-outline": "border-grad bg-card text-foreground hover:shadow-flow",
      },
      size: {
        /* 44 px: el mínimo táctil de iOS. */
        default: "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        /* Compacto, para tablas y barras de escritorio (el panel del administrador). */
        sm: "h-9 gap-1.5 px-4 text-[0.9rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        /* Senda — la acción principal de una pantalla, a lo ancho en móvil. */
        xl: "h-14 gap-2 px-7 text-[1.0625rem] has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
