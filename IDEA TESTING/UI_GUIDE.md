# UI/Design Customization Guide

## 🎨 How to Modify the UI and Design

### 📍 Quick Navigation to Key Files

#### **Colors & Theme**
File: `tailwind.config.ts`

#### **Global Styles**
File: `app/globals.css`

#### **Component Pages**
- Landing Page: `app/page.tsx`
- Dashboard: `app/dashboard/page.tsx`
- Battle: `app/battle/page.tsx`
- Leaderboard: `app/leaderboard/page.tsx`
- Shop: `app/shop/page.tsx`

---

## 1️⃣ Change Colors & Theme

### Edit: `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      // Change primary colors (blue by default)
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',  // Main color - CHANGE THIS
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      // Change accent colors (purple/pink by default)
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',  // Main color - CHANGE THIS
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
      },
    },
  },
}
```

**Popular Color Schemes:**

**🟢 Green Theme:**
```typescript
primary: {
  500: '#10b981', // Emerald
}
accent: {
  500: '#8b5cf6', // Purple
}
```

**🔴 Red Theme:**
```typescript
primary: {
  500: '#ef4444', // Red
}
accent: {
  500: '#f59e0b', // Amber
}
```

**🟣 Purple Theme:**
```typescript
primary: {
  500: '#8b5cf6', // Purple
}
accent: {
  500: '#ec4899', // Pink
}
```

Use [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors) for more options!

---

## 2️⃣ Modify Background & Global Styles

### Edit: `app/globals.css`

**Change Background Gradient:**
```css
body {
  /* Change these colors */
  @apply bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800;
}
```

**Examples:**

**Dark Blue:**
```css
@apply bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900;
```

**Dark Purple:**
```css
@apply bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900;
```

**Solid Dark:**
```css
@apply bg-gray-900;
```

**Light Mode:**
```css
@apply bg-gradient-to-br from-blue-50 via-white to-purple-50;
```

---

## 3️⃣ Customize Specific Pages

### Landing Page (`app/page.tsx`)

**Change Hero Title:**
```typescript
<h1 className="text-6xl md:text-8xl font-bold mb-6 text-gradient glow">
  Quiz Battle  {/* CHANGE THIS */}
</h1>
```

**Change Subtitle:**
```typescript
<p className="text-xl md:text-2xl text-gray-300 mb-12">
  Challenge your knowledge in real-time 1v1 battles  {/* CHANGE THIS */}
</p>
```

**Modify Background Effects (those glowing orbs):**
```typescript
// Make them bigger
<div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />

// Change colors
<div className="... bg-green-500/20 ..." />

// Remove them entirely - just delete the divs
```

---

### Dashboard Layout

**Change Card Colors:**

In `app/dashboard/page.tsx`, find `ActionCard` uses:
```typescript
gradient="from-primary-500 to-primary-600"  // Battle card
gradient="from-accent-500 to-accent-600"     // Leaderboard
gradient="from-yellow-500 to-yellow-600"     // Shop
gradient="from-gray-500 to-gray-600"         // Profile
```

Change to:
```typescript
gradient="from-green-500 to-green-600"
gradient="from-blue-500 to-blue-600"
// etc.
```

---

### Battle Room UI

**Change Timer Color** (`app/battle/[roomCode]/play/page.tsx`):
```typescript
<Clock className={`w-5 h-5 ${timer <= 5 ? 'text-red-400' : 'text-blue-400'}`} />
```

**Modify Answer Buttons:**
```typescript
// Find the button styling around line 150
className={`relative p-4 rounded-xl border-2 ...`}

// Change border radius
rounded-xl → rounded-2xl (more round) or rounded-lg (less round)

// Change padding
p-4 → p-6 (bigger) or p-3 (smaller)
```

---

## 4️⃣ Change Fonts

### Edit: `app/layout.tsx`

```typescript
import { Inter, Poppins, Montserrat } from 'next/font/google';

// Change from Inter to another font
const montserrat = Montserrat({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
```

**Popular Gaming Fonts:**
- Poppins (modern, clean)
- Montserrat (bold, strong)
- Orbitron (futuristic)
- Press Start 2P (retro gaming)

---

## 5️⃣ Modify Component Sizes

### Make Buttons Bigger/Smaller

Find buttons and change classes:
```typescript
// Current
className="px-8 py-4 ..."

// Bigger
className="px-10 py-5 ..."

// Smaller
className="px-6 py-3 ..."
```

### Adjust Card Sizes

```typescript
// Current
className="p-6 rounded-2xl ..."

// Bigger
className="p-8 rounded-3xl ..."

// Smaller
className="p-4 rounded-xl ..."
```

---

## 6️⃣ Add Custom Animations

### Edit: `app/globals.css`

**Add New Animation:**
```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.5s ease-out;
}
```

**Use in Components:**
```typescript
<div className="animate-slideIn">Content</div>
```

**Pre-built Animations Available:**
- `animate-pulse` - Pulsing effect
- `animate-bounce` - Bouncing
- `animate-spin` - Spinning (loading)
- `animate-ping` - Ping effect
- `animate-float` - Custom float (already added)

---

## 7️⃣ Change Icons

### Icons are from `lucide-react`

**Find Icon Imports:**
```typescript
import { Swords, Trophy, Sparkles, ... } from 'lucide-react';
```

**Replace Icons:**
```typescript
// Before
<Swords className="w-8 h-8" />

// After - try different icons
<Zap className="w-8 h-8" />
<Flame className="w-8 h-8" />
<Star className="w-8 h-8" />
```

Browse all icons: [Lucide Icons](https://lucide.dev/icons/)

---

## 8️⃣ Responsive Design (Mobile/Tablet)

### Tailwind Breakpoints:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large (1280px+)

**Example:**
```typescript
className="text-2xl md:text-4xl lg:text-6xl"
// Mobile: 2xl, Tablet: 4xl, Desktop: 6xl
```

---

## 9️⃣ Remove or Add Features

### Hide Elements:
```typescript
<div className="hidden">This won't show</div>
<div className="md:hidden">Hidden on desktop, visible on mobile</div>
<div className="hidden md:block">Hidden on mobile, visible on desktop</div>
```

### Remove Entire Sections:
Just delete or comment out the JSX:
```typescript
{/* <div>This section is hidden</div> */}
```

---

## 🔟 Glass Morphism Effect

Already applied on cards, but you can adjust:

```typescript
className="bg-white/5 backdrop-blur-lg border border-white/10"

// More transparent
bg-white/3 backdrop-blur-sm

// More opaque
bg-white/10 backdrop-blur-xl

// Remove glass effect entirely
bg-gray-800 border border-gray-700
```

---

## 📁 File Structure for UI Changes

```
app/
├── page.tsx              ← Landing page
├── globals.css           ← Global styles & animations
├── layout.tsx            ← Font & layout wrapper
├── dashboard/page.tsx    ← Main dashboard
├── battle/page.tsx       ← Battle menu
│   └── [roomCode]/
│       ├── play/page.tsx     ← Game play screen
│       └── results/page.tsx  ← Results screen
├── leaderboard/page.tsx  ← Leaderboard
├── shop/page.tsx         ← Shop UI
└── auth/
    ├── login/page.tsx    ← Login form
    └── register/page.tsx ← Register form

tailwind.config.ts        ← Colors, theme config
```

---

## 🎨 Quick Customization Checklist

- [ ] Change primary/accent colors in `tailwind.config.ts`
- [ ] Update background gradient in `app/globals.css`
- [ ] Modify page titles in each `page.tsx`
- [ ] Change fonts in `app/layout.tsx`
- [ ] Adjust button sizes (px-*, py-*)
- [ ] Update icon choices from lucide-react
- [ ] Test on mobile (use browser dev tools)
- [ ] Add custom animations if desired

---

## 🔧 Hot Reload

Changes update automatically! Just save the file and refresh browser.

If styles don't update:
```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

---

## 💡 Pro Tips

1. **Use Tailwind CSS Classes** - Pre-built, responsive, consistent
2. **Test on Multiple Screens** - Use browser dev tools (F12) → Device toolbar
3. **Keep it Simple** - Less is more for gaming UIs
4. **Maintain Contrast** - Ensure text is readable on backgrounds
5. **Use Consistent Spacing** - Stick to multiples of 4 (p-4, p-8, p-12)

---

## 🎯 Common Customizations

**Want a light mode?**
- Change background in `globals.css`
- Update text colors from `text-white` to `text-gray-900`
- Change card backgrounds from `bg-white/5` to `bg-white`

**Want no animations?**
- Remove `animate-*` classes
- Delete animation keyframes in `globals.css`

**Want different layout?**
- Modify grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Change flex directions: `flex-row` / `flex-col`

Need help with a specific design change? Let me know!
