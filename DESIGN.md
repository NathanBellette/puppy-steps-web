# Design System Strategy: The Nurturing Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Nurturing Curator."**

In the pet socialization space, users are often overwhelmed by schedules and behavioral benchmarks. Our goal is to move beyond a "utility app" and into a high-end editorial experience. We achieve this by rejecting the rigid, boxy constraints of standard SaaS dashboards in favor of an expansive, breathing layout.

The system utilizes **intentional asymmetry**—offsetting large-scale data visualizations against airy, whitespace-heavy sidebars—and **tonal depth** to guide the eye. By treating the 1440px canvas as a digital magazine spread rather than a spreadsheet, we create a sense of calm authority and premium care.
 
---

## 2. Colors & Surface Philosophy
Our palette is rooted in the "Kindred Paws" deep purple, supported by a sophisticated range of architectural greys and whites.

### The "No-Line" Rule
To maintain an editorial feel, **1px solid borders are strictly prohibited** for sectioning. Boundaries must be defined through background color shifts or tonal transitions. For example, a `surface-container-low` component should sit directly on a `surface` background to create a soft, organic edge.

### Surface Hierarchy & Nesting
Think of the UI as physical layers of fine stationery.
*   **Base Layer:** `surface` (#f9f9fb) for the primary application background.
*   **Secondary Layer:** `surface-container-low` (#f3f3f5) for large structural areas like the sidebar.
*   **Component Layer:** `surface-container-lowest` (#ffffff) for high-priority cards and interactive modules.
*   **Highlight Layer:** `primary-container` (#7c4dff) for active states and progress indicators.

### Glass & Gradient Rule
To add "soul" to the interface, use **Glassmorphism** for floating elements (e.g., tooltips or hover-state cards). Use a semi-transparent `surface-container-lowest` with a `20px` backdrop blur. For primary CTAs and hero headers, apply a subtle linear gradient from `primary` (#632ce5) to `primary-container` (#7c4dff) at a 135-degree angle to provide depth and professional polish.
 
---

## 3. Typography: The Editorial Voice
We use **Plus Jakarta Sans** exclusively. Its geometric clarity provides a modern edge, while its open apertures feel friendly and approachable.

*   **Display (Large/Medium):** Reserved for "Moment of Joy" headers (e.g., "Mochi's Weekly Progress"). Use `display-lg` (3.5rem) with `-0.02em` letter spacing to feel tight and custom.
*   **Headlines:** Used for section titles within the dashboard. `headline-sm` (1.5rem) provides a clear entry point without crowding the layout.
*   **Body Text:** All long-form instructional content must use `body-lg` (1rem) with a generous `1.6` line-height to ensure a premium, readable "nurturing" feel.
*   **Labels:** Use `label-md` (0.75rem) in `on-surface-variant` for metadata, ensuring it recedes visually to let the headlines shine.

---

## 4. Elevation & Depth
We eschew traditional "Drop Shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container` background. The subtle shift in hex value creates a soft lift that feels integrated into the environment.
*   **Ambient Shadows:** If a card must "float" (e.g., a dragged goal card), use a shadow with a `40px` blur, `0%` spread, and `4%` opacity using the `on-surface` color.
*   **Ghost Borders:** If accessibility requires a stroke, use the `outline-variant` token at **20% opacity**. Never use 100% opaque lines.
*   **The "Full/Round" Aesthetic:** Every container uses the `xl` (3rem) or `full` (9999px) corner radius. This communicates safety and friendliness—fundamental traits for a puppy-centric brand.

---

## 5. Components

### Buttons & Chips
*   **Primary Action:** Pill-shaped (`full` roundness). Use the Primary-to-Primary-Container gradient. Padding: `spacing-3` vertical, `spacing-8` horizontal.
*   **Secondary Action:** `surface-container-highest` background with `on-surface` text. No border.
*   **Selection Chips:** Use `secondary-container` for active states. These should feel like soft, touchable "pebbles."

### Sidebar Navigation
*   **Structure:** Occupies 280px width. Use `surface-container-low`.
*   **Icons:** Use "Large" icon variants (24px-32px). Active states utilize a `primary-container` pill background that spans the width of the sidebar minus `spacing-4` margins.

### Wide Responsive Cards
*   **Structure:** No dividers allowed. Separate content (e.g., "Puppy Name" vs "Socialization Goal") using `spacing-6` vertical gaps.
*   **Visuals:** Use high-resolution photography with `lg` (2rem) rounded corners nested inside the `xl` card frame.

### Data Visualization (Gauges & Charts)
*   **Execution:** Utilize the full width of the 1440px grid.
*   **Style:** Line charts should use a `3px` stroke width with "Smooth" (Bezier) interpolation. Use `primary` for the main data line and `tertiary-fixed-dim` for secondary benchmarks.

### Input Fields
*   **Style:** Minimalist. Use `surface-container-high` as the fill. On focus, transition the background to `surface-container-lowest` and add a `2px` `primary` "Ghost Border" at 40% opacity.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. If a card is flush-left, give the right side extra `spacing-24` to create an editorial "white-space" feel.
*   **Do** use the `tertiary` (#904500) palette for "Warning" or "Needs Attention" states; it feels more nurturing and organic than a harsh "Error Red."
*   **Do** prioritize "Breathing Room." If in doubt, double the spacing.

### Don't
*   **Don't** use 1px dividers to separate list items. Use a `12px` vertical gap and a subtle background hover state instead.
*   **Don't** use standard "Box Shadows." They break the "Nurturing Curator" aesthetic. Stick to tonal shifts.
*   **Don't** cram content. On a 1440px screen, use the width for elegance, not for "more data."