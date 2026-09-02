"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange) {
  const media = window.matchMedia(QUERY);

  media.addEventListener("change", onChange);

  return () => {
    media.removeEventListener("change", onChange);
  };
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** En el server asumimos escritorio: el ancho real recien se sabe en el navegador. */
function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
