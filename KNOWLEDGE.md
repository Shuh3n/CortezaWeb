# CortezaWeb - Memoria de Diseño y Arquitectura

Este documento contiene la memoria técnica y de diseño del proyecto CortezaWeb, coordinada entre el equipo y la IA Antigravity.

## Concepto Visual
- **Paleta de Colores**: Bosque Profundo (`#2d5a27`), Cuero Montura (`#8b4513`), Arena Soleada (`#f4a460`).
- **Aesthetics**: "Liquid Glass" con desenfoques de fondo (backdrop-blur) y tarjetas con bordes súper redondeados (`rounded-[32px]` o `rounded-[48px]`).
- **Hero Sections**: Altura moderada (`pt-40 pb-20`). Se debe usar posicionamiento `absolute` con `object-cover` para los fondos. **NO utilizar `background-attachment: fixed` ni `position: fixed`** para fondos, ya que causan distorsión de zoom en diversos viewports.

## Funcionalidades Core
1. **Donaciones Globales**: Implementado vía `ModalContext`. Cualquier botón de donación debe usar el hook `useModal()` y llamar a `openDonationModal()`.
2. **Navegación Inteligente**: El `Navbar` rastrea la ruta activa mediante `useLocation` de `react-router-dom` y aplica indicadores visuales dinámicos.
3. **Sección Salvatón**: Diseñada con alto contraste (`brightness-75 contrast-125`) y degradados oscuros para maximizar la legibilidad del mensaje de campaña.

## Convenciones de Desarrollo
- **Framework**: React 19 + TypeScript + Vite.
- **Estilos**: Tailwind CSS 4.
- **Animaciones**: Framer Motion para entradas suaves y efectos de hover.
- **Despliegue**: Optimizado para Vercel (ver `vercel.json` para manejo de rutas SPA).

---
*Ultima actualización: 8 de Abril, 2026 - Sesión de Estandarización Visual.*
