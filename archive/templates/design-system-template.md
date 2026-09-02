# Project Design System

This file documents the design system for this project. The `@frontend-visual` agent uses this to ensure consistent, pixel-perfect implementation.

## Project Information

- **Project Name**: [Your Project Name]
- **Design Source**: [Figma URL or design files location]
- **Last Updated**: [Date]
- **Maintained By**: [Team/Person]

## Colors

### Brand Colors
```
Primary:     #XXXXXX  (Brand primary color)
Secondary:   #XXXXXX  (Brand secondary color)
Accent:      #XXXXXX  (Accent/highlight color)
```

### Semantic Colors
```
Success:     #XXXXXX  (Success states)
Warning:     #XXXXXX  (Warning states)
Error:       #XXXXXX  (Error states)
Info:        #XXXXXX  (Info states)
```

### Neutral Colors
```
Background:
  - Light:   #XXXXXX  (Light mode background)
  - Dark:    #XXXXXX  (Dark mode background)

Surface:
  - Light:   #XXXXXX  (Cards, panels - light)
  - Dark:    #XXXXXX  (Cards, panels - dark)

Text:
  - Primary:   #XXXXXX  (Main text)
  - Secondary: #XXXXXX  (Secondary text)
  - Disabled:  #XXXXXX  (Disabled text)
  - Inverse:   #XXXXXX  (Text on dark backgrounds)

Border:
  - Default:   #XXXXXX
  - Subtle:    #XXXXXX
  - Strong:    #XXXXXX
```

### Tailwind Config Reference
```javascript
// If using Tailwind, reference your tailwind.config.js
// Location: ./tailwind.config.js
// Or copy your colors here
```

## Typography

### Font Families
```
Primary:     "Inter", sans-serif          (Body text, UI)
Heading:     "Inter", sans-serif          (Headings)
Monospace:   "JetBrains Mono", monospace  (Code)
```

### Font Sizes
```
xs:   12px  (0.75rem)   - Captions, labels
sm:   14px  (0.875rem)  - Small text
base: 16px  (1rem)      - Body text
lg:   18px  (1.125rem)  - Large body
xl:   20px  (1.25rem)   - Small headings
2xl:  24px  (1.5rem)    - Section headings
3xl:  30px  (1.875rem)  - Page headings
4xl:  36px  (2.25rem)   - Hero headings
```

### Font Weights
```
light:    300
normal:   400  (Body text)
medium:   500  (Emphasis)
semibold: 600  (Subheadings)
bold:     700  (Headings)
```

### Line Heights
```
tight:   1.25   (Headings)
normal:  1.5    (Body text)
relaxed: 1.75   (Large text blocks)
```

### Letter Spacing
```
tight:   -0.025em  (Large headings)
normal:   0        (Body text)
wide:     0.025em  (Small caps, labels)
```

## Spacing Scale

Define your spacing system (usually based on a base unit like 4px or 8px):

```
0:    0px      (None)
1:    4px      (0.25rem)   - Tiny gaps
2:    8px      (0.5rem)    - Small gaps
3:    12px     (0.75rem)   -
4:    16px     (1rem)      - Default spacing
5:    20px     (1.25rem)   -
6:    24px     (1.5rem)    - Medium spacing
8:    32px     (2rem)      - Large spacing
10:   40px     (2.5rem)    -
12:   48px     (3rem)      - XL spacing
16:   64px     (4rem)      - XXL spacing
20:   80px     (5rem)      -
24:   96px     (6rem)      - Huge spacing
```

**Base Unit**: [4px / 8px / etc.]

## Breakpoints

Define responsive breakpoints:

```
mobile:     375px   (min-width)  - Mobile phones
tablet:     768px   (min-width)  - Tablets
desktop:    1024px  (min-width)  - Desktop
wide:       1280px  (min-width)  - Wide desktop
ultrawide:  1536px  (min-width)  - Ultra-wide
```

### Layout Constraints
```
Max Content Width:  1280px  (Container max-width)
Gutter Size:        24px    (Left/right padding)
```

## Border Radius

```
none:   0px
sm:     4px      (Subtle rounding)
base:   8px      (Default rounding)
md:     12px     (Medium rounding)
lg:     16px     (Large rounding)
xl:     24px     (Extra large)
full:   9999px   (Pills, circles)
```

## Shadows

```
sm:     0 1px 2px rgba(0, 0, 0, 0.05)                        (Subtle)
base:   0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)  (Default)
md:     0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)  (Medium)
lg:     0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05) (Large)
xl:     0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04) (XL)
```

## Z-Index Scale

Define your z-index system for layering:

```
dropdown:   1000
sticky:     1020
fixed:      1030
modal:      1040
popover:    1050
tooltip:    1060
toast:      1070
```

## Components

### Buttons

**Variants**:
- Primary: [Background color, text color, hover state]
- Secondary: [Background color, text color, hover state]
- Outline: [Border color, text color, hover state]
- Ghost: [Text color, hover state]
- Danger: [Background color, text color, hover state]

**Sizes**:
- sm:   Height 32px, padding 8px 12px, text sm
- base: Height 40px, padding 12px 16px, text base
- lg:   Height 48px, padding 16px 24px, text lg

**Border Radius**: [Value from border radius scale]

### Inputs

**Variants**:
- Default: [Border color, background, focus state]
- Error: [Border color, background]
- Disabled: [Border color, background, text color]

**Sizes**:
- sm:   Height 32px, padding 8px 12px
- base: Height 40px, padding 12px 16px
- lg:   Height 48px, padding 16px 20px

**Border Radius**: [Value]

### Cards

**Padding**: [Spacing value]
**Border**: [Border color, width]
**Border Radius**: [Value]
**Shadow**: [Shadow value]

## Animation/Transitions

```
Duration:
  fast:    150ms  (Micro-interactions)
  base:    200ms  (Default transitions)
  slow:    300ms  (Large movements)

Easing:
  default: cubic-bezier(0.4, 0, 0.2, 1)  (ease-in-out)
  in:      cubic-bezier(0.4, 0, 1, 1)    (ease-in)
  out:     cubic-bezier(0, 0, 0.2, 1)    (ease-out)
```

## Accessibility

### Focus States
- **Focus Ring**: [Color, width, offset]
- **Focus Style**: outline / ring

### Minimum Touch Targets
- **Mobile**: 44px × 44px (iOS guideline)
- **Desktop**: 24px × 24px

### Color Contrast
- **Normal Text**: 4.5:1 (WCAG AA)
- **Large Text**: 3:1 (WCAG AA)
- All color combinations should meet WCAG 2.1 AA standards

## Icon System

**Icon Library**: [Heroicons / FontAwesome / Lucide / Custom]
**Default Size**: 24px
**Sizes**:
- sm: 16px
- base: 24px
- lg: 32px
- xl: 48px

**Stroke Width**: [Value]

## Grid System

**Columns**: 12
**Gutter**: [Spacing value]
**Container Max Width**: [Breakpoint value]

## Notes

Add any project-specific notes or exceptions here:
- [Note about specific component patterns]
- [Note about brand guidelines]
- [Note about design tool versions]

## Resources

- **Figma File**: [URL]
- **Brand Guidelines**: [URL]
- **Component Library**: [URL]
- **Design System Documentation**: [URL]

---

**Instructions for @frontend-visual agent:**

When implementing components:
1. Always reference this design system first
2. Match colors exactly to the palette defined above
3. Use the spacing scale for all margins, padding, and gaps
4. Follow the typography scale for font sizes and weights
5. Test at all defined breakpoints
6. Ensure accessibility requirements are met
