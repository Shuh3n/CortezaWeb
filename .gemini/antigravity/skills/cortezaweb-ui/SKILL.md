---
name: cortezaweb-ui
description: >
  Visual identity and UI consistency patterns for CortezaWeb.
  Trigger: When modifying UI components, buttons, forms, or layouts.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- When adding or modifying buttons and interactive elements.
- When organizing page layouts and removing redundant forms.
- When ensuring consistency with the established visual identity (rounded corners, shadows, cursor states).

## Critical Patterns

- **Interactive Cursors**: Every button, link, and interactive card MUST have the `cursor-pointer` class (unless disabled).
- **Clean Interface**: Avoid redundant "Haz tu pedido" (Make your order) forms if a direct WhatsApp contact method is available in the product detail or banner.
- **Button Styles**: Use rounded-2xl or rounded-[24px] for buttons, and ensure they have hover effects (scale, shadow, or color change).
- **Consistency**: Match the primary color (`bg-primary`) and accent color (`bg-accent`) conventions.

## Code Examples

### Button with Pointer
```tsx
<button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold cursor-pointer hover:opacity-90 transition-all">
  Click Me
</button>
```

### Interactive Card
```tsx
<div 
  onClick={handleAction}
  className="bg-white rounded-[32px] p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
>
  <h3>Card Title</h3>
</div>
```

## Resources

- **Knowledge Base**: See [KNOWLEDGE.md](../../KNOWLEDGE.md) for full visual identity details.
