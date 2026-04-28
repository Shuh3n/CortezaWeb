# CortezaWeb

Sitio web oficial de la Fundacion Corteza Terrestre con secciones publicas, galeria dinamica y panel administrativo protegido.

## Novedades

- Panel administrativo con modulos de Dashboard, Galeria y Gestion de categorias.
- Flujo de desactivacion de categorias con modal de confirmacion y nombre de la categoria seleccionada.
- Subida de imagenes con barra de progreso y soporte para carga multiple.
- Fallback robusto para operaciones admin: si falla la Edge Function, se usa operacion directa a Supabase donde aplica.
- PWA restringida al panel administrativo:
  - Instalacion disponible para rutas /admin y /admin/dashboard.
  - Ruta publica / no se ofrece como app instalable.
  - Guia manual de instalacion para iOS cuando no hay prompt nativo.
- Metadatos SEO/Open Graph/Twitter listos para compartir el sitio en redes.
- Footer actualizado con credito del equipo academico.

## Tecnologias

### Frontend

- React 19
- TypeScript 5
- Vite 8
- React Router 7
- Tailwind CSS 4
- Framer Motion
- Lucide React
- React Hook Form + @hookform/resolvers

### Backend y servicios

- Supabase (Auth, Postgres, Storage, Edge Functions)
- Edge Functions:
  - manage-categories
  - manage-photos

### Calidad de codigo

- ESLint 9
- Vitest + Testing Library + jsdom

### Despliegue

- Vercel (SPA fallback + headers de service worker y webmanifest)

## Arquitectura funcional

### Sitio publico

- Inicio
- Nosotros
- Salvaton
- Voluntario
- Tienda
- Galeria
- Contacto

### Panel admin

- /admin: login
- /admin/dashboard: metricas y resumen de contenido
- /admin/galeria: carga de imagenes y vista previa
- /admin/gestion: categorias activas/inactivas con activacion y desactivacion

### Autenticacion

- Login con email/contrasena usando Supabase Auth.
- Rutas protegidas mediante ProtectedRoute.

## PWA (solo admin)

La instalacion como app esta habilitada solo para el panel administrativo.

- Manifest admin: public/admin-manifest.webmanifest
- Service worker admin: public/admin-sw.js
- Hook de manejo de instalacion y estado standalone: src/hooks/useAdminPwa.ts

Comportamiento esperado:

- /admin y /admin/dashboard: pueden mostrar instalacion.
- /: no debe mostrar instalacion.

## Estructura del proyecto

```text
src/
  components/       Componentes reutilizables de UI
  constants/        Constantes y utilidades de galeria
  context/          Contextos globales (auth, modal)
  hooks/            Hooks custom (incluye PWA admin)
  layouts/          Layout publico y layout admin
  lib/              Integraciones con Supabase y APIs admin
  pages/            Paginas publicas y de administracion
  types/            Tipos TypeScript compartidos

public/
  admin-manifest.webmanifest
  admin-sw.js
  manifest.webmanifest
  sw.js
  icons/
  images/

supabase/
  functions/
    manage-categories/
    manage-photos/
```

## Variables de entorno

Crear un archivo .env con:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Sin esas variables la app falla al iniciar el cliente de Supabase.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Desarrollo local

1. Instalar dependencias con npm install.
2. Configurar variables de entorno de Supabase.
3. Ejecutar npm run dev.
4. Abrir la app en http://localhost:5173.
5. Probar rutas publicas y admin.

## Pruebas

Actualmente hay pruebas unitarias para utilidades de galeria en src/lib/gallery.test.ts:

- normalizacion de texto y slugs
- construccion de rutas de storage
- resumen de imagenes por categoria

## Integracion con Supabase

Desde src/lib/adminApi.ts:

- createCategory
- updateCategory
- setCategoryStatus
- uploadPhotos
- updatePhoto
- deletePhoto

Estrategia de resiliencia:

- Se intenta primero Edge Function autenticada.
- Si falla en casos contemplados, se usa fallback directo para mantener operatividad del panel.

## Configuracion de Vercel

El archivo vercel.json incluye:

- headers para service workers
- content type para .webmanifest
- enrutamiento SPA con fallback a /index.html

## UI y estilo

Lineamientos de diseno documentados en KNOWLEDGE.md:

- paleta institucional
- estetica de tarjetas y blur
- orden oficial de navegacion
- convenciones de interaccion

## Creditos

Hecho por los estudiantes del curso de Semionario de Ingeniería de Ingenieria de Sistemas y Computacion de la Uniquindio.
