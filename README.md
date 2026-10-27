# vip

Design tokens for a branded iOS app built on the iOS 27 Builder Figma kit.

**Flow:** Figma variables → Tokens Studio pushes `tokens/tokens.json` → GitHub Action runs Style Dictionary → SwiftUI files in `ios/DesignSystem` plus an asset catalog for Xcode and `web/src/tokens*.css` for the Vercel demo → Vercel redeploys.

| Path | What it is |
| --- | --- |
| `tokens/tokens.json` | Source of truth, written by Tokens Studio. Edit in Figma, not here. |
| `sd.config.mjs` | Style Dictionary build. Sets with "Dark" in the name become the dark theme. |
| `ios/` | Generated SwiftUI design system, asset catalog and brand font files for the developer. |
| `ios-system-map.json` | Which tokens iOS owns (emitted as system references, never hex) and which text styles map to Dynamic Type. VIP uses its own neutrals, so no colours are listed and every colour is brand-owned. |
| `web/` | The Vercel demo: `index.html` is the functional VIP Photographer App prototype (vanilla HTML, CSS and JS: `demo.css`, `data.js`, `ui.js`, `screens-*.js`, `overlays.js`, `app.js`), and `tokens-preview.html` is the original token preview. Also web styling a developer can reuse: CSS variables with system dark mode, `fonts.css` and a Tailwind preset (`web/tailwind.preset.js`). |
| `HANDOFF.md` | Developer instructions. |

Rebuild locally: `npm install && npm run tokens`.

The placeholder tokens use the iOS 27 defaults and a sample blue until Tokens Studio pushes the real values.

## Functional demo

`web/index.html` runs the whole VIP Photographer App design as a clickable, working prototype (no build step; it reads the generated token CSS). Open it on a phone or desktop. It covers Sign in and Register (invite code `VIP-4829-KQ`, any 6-digit code), Schedule and Assignment Details with the full journey (Start Travel, Arrived, Start Assignment, End Assignment, photo upload, Timesheet), Report issue and Equipment issue, Time Off request, withdraw and cancel, Timesheets (Open, Approved, Paid, entry details, payment statements, year to date), Account and Notifications. Every date is relative to the device's date when the page opens (assignments around today, pay periods as Monday to Sunday weeks, time off within the next 14 days), so the demo always looks current. The Jump menu, Restart, and Light/Dark buttons sit above the phone. All data, rates and amounts are placeholders and nothing is sent anywhere.
