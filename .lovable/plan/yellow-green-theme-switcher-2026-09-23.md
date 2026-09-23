# Yellow & Green Theme Switcher

## Goal
Add an optional sunny yellow-and-green appearance across Zhoop while keeping the existing mint appearance available at any time.

## Changes
- Add a compact theme toggle in the top bar, labeled clearly for “Original” and “Yellow + Green”.
- Save the selected appearance on the device so it remains active after refreshing or returning later.
- Create a cohesive yellow-and-green token set for page backgrounds, cards, borders, buttons, tabs, highlights, and decorative stripes.
- Keep all existing pages, content, and behavior unchanged; the alternate appearance will reuse the same layout.
- Ensure the selector remains usable on both mobile and desktop.

## Technical details
- Apply a theme class to the document root and override existing semantic color tokens rather than hardcoding colors throughout pages.
- Add restrained stripe accents through shared layout styles so the new direction feels intentional without reducing readability.
- Respect the current component system and accessibility contrast.
- Verify both appearances in the running preview at desktop and mobile widths.
