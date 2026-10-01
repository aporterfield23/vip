# vip

Design tokens for a branded iOS app built on the iOS 27 Builder Figma kit.

**Flow:** Figma variables → Tokens Studio pushes `tokens/tokens.json` → GitHub Action runs Style Dictionary → SwiftUI files in `ios/DesignSystem` plus an asset catalog for Xcode and `web/src/tokens*.css` for the Vercel demo → Vercel redeploys.

| Path | What it is |
| --- | --- |
| `tokens/tokens.json` | Source of truth, written by Tokens Studio. Edit in Figma, not here. |
| `sd.config.mjs` | Style Dictionary build. Sets with "Dark" in the name become the dark theme. |
| `ios/` | Generated SwiftUI design system, asset catalog and brand font files for the developer. |
| `ios-system-map.json` | Which tokens iOS owns (emitted as system references, never hex) and which text styles map to Dynamic Type. |
| `web/` | The Vercel demo page. |
| `HANDOFF.md` | Developer instructions. |

Rebuild locally: `npm install && npm run tokens`.

The placeholder tokens use the iOS 27 defaults and a sample blue until Tokens Studio pushes the real values.
