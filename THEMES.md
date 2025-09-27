# 🎨 Theme System Guide

## Current Themes

| Theme | Email Format | Logo | Colors | Auto-Process |
|-------|-------------|------|--------|--------------|
| **Academic** | `.edu`, `university`, `college` | 🎓 Blue Circle | Professional Blues | ✅ Yes |
| **Corporate** | `.com`, `.org`, `.net` | 💼 Green Rounded | Professional Green | ❌ Manual |
| **Government** | `.gov`, `.mil` | 🏛️ Gray Square | Serious Grays | ❌ Manual |
| **Tech** | `google.com`, `microsoft.com`, etc. | ⚡ Purple Hexagon | Purple Gradient | ✅ Yes |
| **Healthcare** | `.med`, `hospital`, `health`, `medical` | ⚕️ Blue Circle | Medical Blue | ✅ Yes |
| **Creative** | `design`, `studio`, `agency` | 🎨 Pink Rounded | Pink/Orange Gradient | ❌ Manual |

## 🔧 Quick Add New Theme

### 1. Add Theme Definition
**File:** `/lib/themes.ts`

```typescript
// Add to themes object around line 30
financial: {
  name: 'Financial',
  colors: {
    primary: '#1e3a8a',        // Deep blue
    secondary: '#1e40af',      // Blue
    accent: '#fbbf24',         // Gold accent
    background: '#f8fafc',     // Light gray
    surface: '#ffffff',        // White
    text: '#1e293b',           // Dark
    textSecondary: '#64748b',  // Gray
    border: '#e2e8f0',         // Light border
    success: '#059669',        // Green
    warning: '#d97706',        // Orange
    error: '#dc2626'           // Red
  },
  logo: {
    icon: '🏦',                // Bank emoji
    bgColor: '#1e3a8a',        // Deep blue
    textColor: '#ffffff',      // White text
    shape: 'square'            // Square shape
  },
  description: 'Professional financial theme'
},
```

### 2. Add Domain Detection
**File:** `/lib/themes.ts` in `getThemeFromEmail()` function around line 120

```typescript
// Financial institutions
if (domain.includes('bank') || domain.includes('finance') || domain.endsWith('.bank')) {
  return themes.financial
}
```

### 3. Set Auto-Processing (Optional)
**File:** `/app/upload/page.tsx` in `shouldAutoProcess()` function around line 80

```typescript
// Financial - high security, manual approval
if (domain.includes('bank') || domain.includes('finance')) {
  return false  // Manual approval required
}
```

## 🧪 Testing

1. Use the 🎨 button (ThemeSwitcher) in top-right
2. Test emails:
   - `user@bank.com` → Should trigger financial theme
   - `test@jpmorgan.com` → Should trigger financial theme
3. Verify:
   - Colors change throughout UI
   - Logo updates with correct icon/shape
   - Auto-processing indicator shows correct status

## 📁 Key Files

- `/lib/themes.ts` - Theme definitions and logic
- `/components/ThemeProvider.tsx` - Theme context
- `/components/DynamicLogo.tsx` - Logo component
- `/components/ThemeSwitcher.tsx` - Testing component
- `/app/upload/page.tsx` - Auto-processing logic
- `/app/globals.css` - CSS variables

## 🎯 Theme Properties

### Required Colors (11 total):
- `primary` - Main brand color
- `secondary` - Secondary brand color
- `accent` - Highlight/accent color
- `background` - Page background
- `surface` - Card/component background
- `text` - Primary text color
- `textSecondary` - Secondary text color
- `border` - Border color
- `success` - Success state color
- `warning` - Warning state color
- `error` - Error state color

### Logo Properties:
- `icon` - Emoji or single character
- `bgColor` - Logo background color
- `textColor` - Logo text color
- `shape` - 'circle' | 'square' | 'rounded' | 'hexagon'
- `gradient` - Optional CSS gradient string

## 💡 Best Practices

1. **Consistent Contrast** - Ensure text is readable on backgrounds
2. **Brand Alignment** - Match colors to organization type
3. **Accessibility** - Test with color-blind users
4. **Performance** - CSS variables enable smooth transitions
5. **Testing** - Always test with real email formats

---

**Need to add a theme? Just follow the 3 steps above!** 🚀