# Brand iOS App — Developer Handoff

Approved version: (tag, e.g. brand-v1.0)
Demo: (Vercel production URL)
Figma: (file link, page "Screens")

## Design tokens
Generated from `tokens/tokens.json` by `npm install && npm run tokens` (Node 22+). Do not edit the generated files by hand.

- `ios/DesignSystem/Colors.swift`: `Color.Brand.*`. Colours iOS owns (backgrounds, label colours, separator) are references such as `Color(uiColor: .systemBackground)` and `Color.primary`, so they follow iOS in dark mode and future releases. Brand colours point to the asset catalog.
- `ios/Assets.xcassets`: brand-owned colours only, each with light and dark appearances. Add the folder to the app target (or merge its colorsets into the app's catalog).
- `ios/DesignSystem/Typography.swift`: `Font.Brand.*` built on iOS text styles (`.body`, `.largeTitle` and so on), so Dynamic Type works. A custom brand font uses `Font.custom(_:size:relativeTo:)`. `Tracking.*` holds letter spacing; apply with `.tracking()`.
- `ios/DesignSystem/Spacing.swift`: `Spacing.*` and `Radius.*` in points, 1:1 with Figma.
- `ios/DesignSystem/kit-tokens.json`: manifest mapping each Figma token to its Swift expression and colorset, for syncing changes back to Figma.
- `ios-system-map.json` decides which tokens are system-owned. Edit it to move a token between system and brand.

## Fonts
- Files in `ios/Fonts/`. Add them to the app target and list them under "Fonts provided by application" (UIAppFonts) in Info.plist.
- `Typography.swift` already wraps custom fonts in `Font.custom(_:size:relativeTo:)`. If the font's PostScript name differs from its family name, update the family token in Figma so the generated name matches.
- If a family is "SF Pro", the generated code uses the system font; don't bundle SF Pro.

## Screens in scope
1. Launch 2. Home 3. Detail 4. Settings

## Accessibility
- WCAG AA contrast checked in the Brand Token Spec
- 44x44 pt minimum tap targets

## Contact
Alan Porterfield
