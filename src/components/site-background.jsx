"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Fondo a pantalla completa para las paginas publicas.
 *
 * Se queda fijo mientras scrolleas y va cambiando de imagen segun la seccion
 * que estes mirando, con un fundido entre una y otra. El contenido de la
 * pagina va encima, asi que cada foto lleva un velo que la oscurece lo justo
 * para que el texto se lea sin taparla.
 *
 * Se configura con `sections`, en el mismo orden en que aparecen en la pagina:
 *
 *   [{ id: "inicio", src: "/fondo-edificio.jpg", position: "center" }, ...]
 *
 *   id        el id del <section> en la pagina. Tiene que existir.
 *   src       la foto, dentro de /public. Sin `src`, esa seccion muestra el
 *             fondo generado con CSS (manchas de color, grilla y ruido).
 *   position  que parte de la foto se prioriza cuando se recorta, con la misma
 *             sintaxis de `object-position` ("center", "left center", "top").
 *             Sirve para que el motivo no quede afuera del encuadre.
 *   veil      cuanto se oscurece, de 0 a 100. Por defecto 65. Subilo si sobre
 *             esa foto el texto no se lee; bajalo si la foto queda apagada.
 *   alt       texto alternativo. Vacio si la foto es decorativa.
 */
export function SiteBackground({ sections = [] }) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? null);
  const ids = sections.map((section) => section.id).join(",");

  React.useEffect(() => {
    const list = ids.split(",").filter(Boolean);

    if (list.length === 0) {
      return;
    }

    /**
     * Gana la ultima seccion cuyo borde de arriba ya cruzo una linea imaginaria
     * al 45% de la pantalla.
     *
     * No se usa `IntersectionObserver` con `intersectionRatio` porque el ratio
     * es superficie visible sobre superficie total: una seccion alta que llena
     * la pantalla da un ratio bajo y una cortita da 1, asi que gana la que no
     * es. Ademas la primera seccion suele ser un contenedor que envuelve toda
     * la pagina, y por superficie gana siempre.
     */
    function pick() {
      const probe = window.innerHeight * 0.45;
      let current = list[0];

      for (const id of list) {
        const element = document.getElementById(id);

        if (element && element.getBoundingClientRect().top <= probe) {
          current = id;
        }
      }

      setActiveId(current);
    }

    // Primera medicion fuera del cuerpo del efecto, para no encadenar renders.
    const timer = window.setTimeout(pick, 0);

    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [ids]);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      aria-hidden="true"
    >
      {/* Capa de abajo: el fondo generado con CSS. Se ve cuando la seccion
          activa no tiene foto, y hace de colchon durante el fundido. */}
      <AuroraLayer />

      {sections
        .filter((section) => section.src)
        .map((section) => (
          <ImageLayer
            key={section.id}
            active={section.id === activeId}
            {...section}
          />
        ))}

      <div className="bg-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />
    </div>
  );
}

function ImageLayer({ active, alt = "", position = "center", src, veil = 65 }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <Image
        alt={alt}
        className="object-cover"
        fill
        priority={active}
        sizes="100vw"
        src={src}
        style={{ objectPosition: position }}
      />

      {/* Velo parejo para que el texto se lea, mas un refuerzo arriba y abajo
          donde se apoyan el header pegajoso y el pie. */}
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: veil / 100 }}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function AuroraLayer() {
  return (
    <div className="absolute inset-0">
      <div className="aurora-blob absolute -left-40 -top-40 size-[38rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="aurora-blob aurora-blob-slow absolute -right-52 top-24 size-[34rem] rounded-full bg-income/20 blur-[130px]" />
      <div className="aurora-blob aurora-blob-slower absolute -bottom-56 left-1/3 size-[42rem] rounded-full bg-primary/15 blur-[140px]" />

      <div className="bg-grid absolute inset-0 opacity-[0.35]" />

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
