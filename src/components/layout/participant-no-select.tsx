"use client";

import { useEffect } from "react";

const CLASS = "participant-no-select";

/**
 * Mientras se está en una pantalla del participante, `<body>` no deja seleccionar texto (ver `.participant-no-select`
 * en globals.css). Va en <body> y no solo en el layout para cubrir lo que se pinta fuera (diálogos, cajones, avisos,
 * el tutorial); al salir hacia el panel del administrador se quita.
 */
export function ParticipantNoSelect() {
  useEffect(() => {
    document.body.classList.add(CLASS);
    return () => document.body.classList.remove(CLASS);
  }, []);
  return null;
}
