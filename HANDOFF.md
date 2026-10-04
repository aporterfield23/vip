# Brand iOS App — Developer Handoff

Approved version: (tag, e.g. brand-v1.0)
Demo: (Vercel production URL)
Figma: (file link, page "Screens")

## Design tokens
Generated from `tokens/tokens.json` by `npm install && npm run tokens` (Node 22+). Do not edit the generated files by hand.

- `ios/DesignSystem/Colors.swift`: `Color.Brand.*`. Colours iOS owns (backgrounds, label colours, separator) are references such as `Color(uiColor: .systemBackground)` and `Color.primary`, so they follow iOS in dark mode and future releases. Brand colours point to the asset catalog.
- `ios/Assets.xcassets`: brand-owned colours only, each with light, dark and Increase Contrast appearances (the stronger variants reach at least 7:1 against every background and surface; colours already at 7:1 keep their value). Add the folder to the app target (or merge its colorsets into the app's catalog).
- `ios/Assets.xcassets/AccentColor`: the app tint, with the same values as `Color.Brand.accent`. New Xcode projects already use the asset named AccentColor (build setting "Global Accent Color Name"), so controls, toggles and links pick up the brand colour with no extra code. Remove the template's own AccentColor if it has one.
- Every token build is checked on GitHub with Apple's tools: the Swift is type-checked for iOS 17 and the asset catalog is compiled (job `check-ios` in `.github/workflows/tokens.yml`). A green run means the generated files compile.
- `ios/DesignSystem/Typography.swift`: `Font.Brand.*` built on iOS text styles (`.body`, `.largeTitle` and so on), so Dynamic Type works. A custom brand font uses `Font.custom(_:size:relativeTo:)`. `Tracking.*` holds letter spacing; apply with `.tracking()`.
- `ios/DesignSystem/Spacing.swift`: `Spacing.*` and `Radius.*` in points, 1:1 with Figma.
- `ios/DesignSystem/kit-tokens.json`: manifest mapping each Figma token to its Swift expression and colorset, for syncing changes back to Figma.
- `ios-system-map.json` decides which tokens are system-owned. Edit it to move a token between system and brand.

## Fonts
Titles (Large Title, Title 1 to 3) use **Encode Sans**; everything else uses SF Pro, the system font, which needs no files.

- Font files are in `ios/Fonts/`, taken unmodified from the Encode Sans project (SIL Open Font License; keep `OFL.txt` with them):

  | File | Weight | PostScript name | Used by |
  |---|---|---|---|
  | `EncodeSans-Bold.ttf` | 700 | `EncodeSans-Bold` | Large Title, Title 1, Title 2 |
  | `EncodeSans-SemiBold.ttf` | 600 | `EncodeSans-SmBold` | Title 3 |
  | `EncodeSans-Regular.ttf` | 400 | `EncodeSans-Regular` | Not used by the tokens yet; included for app copy that needs it |

- Setup: drag the three `.ttf` files into Xcode with the app target ticked, then add them to Info.plist under "Fonts provided by application" (`UIAppFonts`):

  ```xml
  <key>UIAppFonts</key>
  <array>
      <string>EncodeSans-Bold.ttf</string>
      <string>EncodeSans-SemiBold.ttf</string>
      <string>EncodeSans-Regular.ttf</string>
  </array>
  ```

- `Typography.swift` asks for the family `"Encode Sans"` and sets the weight (`.bold`, `.semibold`), so iOS picks the matching file. Check a title on a device: if it shows in SF Pro, the font isn't registered (check the target membership and the Info.plist names). Don't rename the family token in Figma to fix it, because the website loads the font by that name.
- Dynamic Type still works: each style uses `relativeTo:` an iOS text style. Encode Sans is wide, so check long titles at the largest accessibility sizes.
- The website loads Encode Sans from Google Fonts (`web/src/fonts.css`), so these files are for the app only.
- Never bundle SF Pro; the generated code uses the system font for it.

## Website
The same tokens style a website. Everything is in `web/`:
- `web/src/tokens.css` and `web/src/tokens-dark.css`: CSS variables (`var(--color-accent)`, `var(--space-md)`, `var(--type-body-size)` and so on). Dark mode follows the visitor's system setting; set `data-mode="light"` or `data-mode="dark"` on any element to force a mode. Stronger colours apply automatically when the browser asks for more contrast.
- `web/src/fonts.css`: loads the brand fonts from Google Fonts. Font variables already include a system-font fallback; SF Pro is licensed for Apple platforms only, so the web uses the device's system font (SF on Apple devices).
- `web/tailwind.preset.js`: a Tailwind theme pointing at the CSS variables (Tailwind 3: `presets: [...]`; Tailwind 4: `@config`). Classes like `bg-accent`, `p-md`, `rounded-lg`, `font-display` and `text-body` switch with light, dark and contrast settings, so colour needs no `dark:` variants.
- Text sizes are fixed pixel values from the iOS default size; use them with responsive units if the site needs to scale.

## Screens in scope
1. Launch 2. Home 3. Detail 4. Settings

## Accessibility
- WCAG AA contrast checked in the Brand Token Spec
- Increase Contrast supported: brand colours switch to stronger variants (at least 7:1) automatically, in the app and on the web (prefers-contrast: more)
- 44x44 pt minimum tap targets

## Contact
Alan Porterfield
