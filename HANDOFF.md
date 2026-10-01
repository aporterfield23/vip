# Brand iOS App — Developer Handoff

Approved version: (tag, e.g. brand-v1.0)
Demo: (Vercel production URL)
Figma: (file link, page "Screens")

## Design tokens
- `ios/BrandTokens.swift` (light / shared) and `ios/BrandTokensDark.swift` (dark colors) are generated from `tokens/tokens.json`. Do not edit by hand.
- Rebuild: `npm install && npm run tokens` (Node 22+).
- Values are in points, 1:1 with Figma.
- Dark mode: combine the two files into dynamic colors, e.g. `UIColor { $0.userInterfaceStyle == .dark ? BrandTokensDark.colorAccent : BrandTokens.colorAccent }`, or map them into Asset Catalog colors with Any/Dark appearances.

## Fonts
- Files in `ios/Fonts/`. Add them to the app target and list them under "Fonts provided by application" (UIAppFonts) in Info.plist.
- Use `Font.custom("<PostScript name>", size: BrandTokens.typeBodySize, relativeTo: .body)` so Dynamic Type still scales.
- If a family is "SF Pro", use the system font (`.system`) instead of bundling it.

## Screens in scope
1. Launch 2. Home 3. Detail 4. Settings

## Accessibility
- WCAG AA contrast checked in the Brand Token Spec
- 44x44 pt minimum tap targets

## Contact
Alan Porterfield
