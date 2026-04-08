# CortezaWeb Visual Identity & Hero System

This Knowledge Item (KI) defines the established patterns for visual components in CortezaWeb to ensure consistency and avoid recurring technical bugs across all devices.

## 1. Backgrounds & Parallax
- **Pattern**: Always use standard `absolute` positioning with `object-cover`.
- **Constraint**: DO NOT use `background-attachment: fixed` or `position: fixed` for hero/stats backgrounds. These properties scale to the viewport and cause "zoomed" distortion artifacts on high-resolution screens and small containers.
- **Darkening/Contrast**: For high-impact heros (like Salvatón), apply CSS filters: `brightness-75 contrast-125` plus a bottom-up gradient overlay (`bg-gradient-to-t from-primary/90 via-primary/40 to-transparent`).

## 2. Component Layout
- **Hero Size**: Standard padding is `pt-40 pb-20`.
- **Containers**: Use centered containers with `w-[70%] mx-auto`.
- **Card Design**: Stats and informational cards should use `bg-white/10 backdrop-blur-md` with `rounded-[32px]` for a premium "Liquid Glass" feel.

## 3. Global Systems
- **Donations**: Controlled by `ModalContext`. Trigger via `openDonationModal()`.
- **Navigation**: Desktop and Mobile Navbar track active routes via `useLocation` for real-time visual feedback.

---
*This manifest ensures that any agent (human or AI) starting a new session on this repository maintains the premium design quality without repeating past debugging cycles.*
