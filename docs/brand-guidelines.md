# Sentauri AI Brand Guidelines

## Brand Overview

**Brand Essence:** "Sophisticated Tech Made Accessible"

Sentauri AI bridges enterprise-level AI capabilities with SMB accessibility through a premium yet approachable visual identity.

---

## 1. Logo & Identity

### Primary Logo
- **Design:** Wave/neural path connecting 3 nodes
- **Symbolism:** Data flow, neural networks, connectivity
- **Style:** Minimalist, tech-forward
- **Wordmark:** "SENTAURI" - uppercase, tracking-tight, sans-serif

### Logo Specifications
```
Primary Size: 120x80 (base)
Header Usage: 36x36
Footer Usage: 32x32
Minimum Size: 24x24
Clear Space: Equal to node diameter
```

### Logo Colors
- Gradient application: Blue (#3B82F6) → Cyan (#00CEC8) → Green (#4ADE80)
- Nodes: White with 90% opacity
- Path: Gradient stroke, 3-4px weight

---

## 2. Color Palette

### Primary Colors
```
Sentauri Blue    #3B82F6    RGB(59, 130, 246)
Sentauri Cyan    #00CEC8    RGB(0, 206, 200)
Sentauri Green   #4ADE80    RGB(74, 222, 128)
```

### Neutral Colors
```
Dark Background  #0F172A    RGB(15, 23, 42)
Medium Dark      #1E293B    RGB(30, 41, 59)
Glass Overlay    rgba(255, 255, 255, 0.05)
```

### Text Colors
```
Primary Text     #FFFFFF    100% opacity
Secondary Text   #FFFFFF    80% opacity
Muted Text       #FFFFFF    60% opacity
Subtle Text      #FFFFFF    40% opacity
```

### Semantic Colors
```
Success          #4ADE80    Green
Error            #F87171    Red
Warning          #FB923C    Orange
Info             #60A5FA    Blue
```

### Gradient Definitions
```
Primary CTA:     linear-gradient(to right, #3B82F6, #00CEC8)
Accent:          linear-gradient(to right, #3B82F6, #4ADE80, #00CEC8)
Text Highlight:  linear-gradient(to right, #60A5FA, #00CEC8)
```

---

## 3. Typography

### Font Families
- **Headers:** Georgia, serif (or similar serif)
- **Body:** system-ui, -apple-system, sans-serif

### Type Scale
```
Hero Headline    72px    Light (300)     Leading: 1.1
Section Header   48px    Light (300)     Leading: 1.2
Subsection       36px    Regular (400)   Leading: 1.3
Card Title       24px    Semibold (600)  Leading: 1.4
Body Large       18px    Regular (400)   Leading: 1.6
Body             16px    Regular (400)   Leading: 1.6
Small Text       14px    Regular (400)   Leading: 1.5
Caption          12px    Regular (400)   Leading: 1.5
```

### Typography Rules
- Hero headlines: Always light weight, tight tracking
- Gradient text: Applied to key value propositions only
- Body text: Optimal readability with 60-80 character line length
- All caps: Limited to small UI elements and navigation

---

## 4. Visual Effects

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1)
border-radius: 8-16px
```

### Shadow System
```
Subtle:  0 2px 4px rgba(0, 0, 0, 0.1)
Medium:  0 4px 12px rgba(0, 0, 0, 0.15)
Strong:  0 10px 25px rgba(0, 206, 200, 0.25)
```

### Animation Principles
- **Duration:** 300-600ms for micro-interactions
- **Easing:** ease-out for natural movement
- **Purpose:** Every animation must enhance UX, not distract

### Standard Animations
1. **Fade In Up:** Content reveals (30px translate)
2. **Float:** Decorative elements (6s loop, 20px range)
3. **Pulse:** Attention-drawing elements (2s loop)
4. **Data Flow:** SVG path animations (3s loop)
5. **Glow Pulse:** Special emphasis (3s loop)

---

## 5. UI Components

### Buttons

**Primary CTA**
- Background: Blue to cyan gradient
- Padding: 12px 24px
- Border Radius: 8px
- Font: Medium weight, white
- Hover: Add shadow + scale(1.02)

**Secondary Button**
- Border: 1px solid rgba(255,255,255,0.3)
- Background: Transparent
- Hover: rgba(255,255,255,0.1) background

### Cards
- Glass effect background
- Border radius: 12-16px
- Padding: 32px
- Hover: scale(1.05) + colored shadow

### Input Fields
- Background: rgba(255,255,255,0.05)
- Border: 1px solid rgba(255,255,255,0.1)
- Focus: Cyan border (#00CEC8)
- Padding: 12px 16px
- Border radius: 8px

---

## 6. Iconography

### Icon Style
- Library: Lucide or similar minimalist sets
- Stroke: 2px consistent weight
- Sizes: 16px, 20px, 24px
- Color: Match surrounding text or use accent colors

### Key Icons
- **AI/Tech:** Brain, Network, Sparkles
- **Trust:** Shield, Check, Award
- **Action:** ArrowRight, ChevronDown
- **Features:** Zap, Phone, MessageSquare

### Icon Usage
- Always paired with text for clarity
- Contained in colored backgrounds for emphasis
- Consistent sizing within contexts

---

## 7. Layout Principles

### Spacing System
```
Base unit: 4px
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
Section padding: 96px vertical
Container max-width: 1152px
Content padding: 32px horizontal
```

### Grid System
- 12-column grid on desktop
- 6-column grid on tablet
- 4-column grid on mobile
- Gutters: 32px desktop, 16px mobile

### Visual Hierarchy
1. Hero headlines (largest, gradient)
2. Section headers (serif, generous space)
3. Subheadings (clear weight difference)
4. Body text (consistent, readable)
5. Captions (smaller, muted)

---

## 8. Decorative Elements

### Neural Network Pattern
- SVG paths with gradient strokes
- Animated with CSS (data-flow effect)
- 30% opacity for subtlety
- Used as background element only

### Gradient Overlays
- Subtle color washes over dark backgrounds
- Always maintain text readability
- Direction: top-to-bottom or diagonal

### Floating Elements
- Small circular nodes
- Subtle float animation
- Sparse distribution
- Tech/space theme

---

## 9. Photography & Imagery

### Style Direction
- Abstract tech visuals preferred
- Dark backgrounds with light accents
- Gradient overlays acceptable
- Avoid generic stock photos

### Treatment
- High contrast
- Cool color temperature
- Blur or overlay for text readability
- Tech/AI themed when possible

---

## 10. Voice & Tone

### Visual Voice Principles
- **Sophisticated** but not intimidating
- **Modern** but not trendy
- **Technical** but accessible
- **Premium** but approachable

### Design Dos
- ✓ Use space generously
- ✓ Apply gradients purposefully
- ✓ Maintain visual consistency
- ✓ Prioritize readability

### Design Don'ts
- ✗ Overcrowd layouts
- ✗ Use more than 3 gradient colors
- ✗ Apply effects without purpose
- ✗ Sacrifice function for form

---

## 11. Application Examples

### Marketing Materials
- Dark backgrounds mandatory
- Gradient CTAs for primary actions
- Glass effects for content cards
- Neural patterns as subtle backgrounds

### Digital Interfaces
- Consistent component styling
- Smooth micro-interactions
- Clear visual feedback
- Accessible contrast ratios

### Brand Extensions
- Maintain color palette strictly
- Adapt patterns, not core elements
- Scale typography proportionally
- Keep animation principles

---

## 12. Accessibility

### Color Contrast
- Text on dark: Minimum 4.5:1 ratio
- Important text: 7:1 ratio preferred
- Interactive elements: Clear focus states

### Motion
- Respect prefers-reduced-motion
- Provide pause controls for loops
- Keep essential content static

### Typography
- Minimum 16px for body text
- Line height minimum 1.5
- Sufficient paragraph spacing

---

*Version 1.0 - 2024*
*© Sentauri AI Solutions Inc.*