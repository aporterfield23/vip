# VIP Photographer App: SwiftUI implementation notes

For the developer building the screens. Read `HANDOFF.md` first: it covers the tokens, fonts and asset catalog. This file covers how the design decisions map to SwiftUI, what to ignore, and what still needs checking.

**Status: first version, written without Xcode.** Nothing here has been compiled or run on a device. The SwiftUI is a sketch of the approach, not tested code. The one thing that has been checked is colour contrast, which is calculated from the token values in `ios/DesignSystem/Colors.swift`.

Where the decisions come from: [design-decisions.html](../web/design-decisions.html) (numbers below match its nine changes), the PRD ([prd.html](../web/prd.html)) and the clickable demo ([web/index.html](../web/index.html)). The demo is a prototype of the behaviour, not of the code.

## Principles

1. **Use system components first.** `Menu`, `Button` styles, `NavigationStack` toolbars, `TabView`, `List` and `confirmationDialog` give Dynamic Type, VoiceOver, Increase Contrast and Dark mode with no work. The demo draws look-alikes of all of them.
2. **Colour comes from the tokens.** Use `Color.Brand.*`; never hex values. Two tokens matter most here (see "Accent colour" below).
3. **Do not copy Figma overrides.** Several Figma changes are hand-set fills on single frames. The native fix is a token or a system style, not a copy of the override.

## Accent colour: which token

`Color.Brand.accent` is the fill colour (Light #007e52, Dark #278462). `Color.Brand.accentStrong` is the text and glyph colour (Light #006642, Dark #80ccb1).

| Use | Token | Contrast |
|---|---|---|
| Fill of the primary button (white label) | `accent` | Light 5.11:1, Dark 4.60:1 |
| Glyphs and text in the accent colour on a page (map icon, back, previous, next, plain rows) | `accentStrong` | Light 7.05:1, Dark 9.4:1 |
| Same glyphs using `accent` in Dark | not recommended | 3.83:1, fails AA for text and icons that carry meaning |

The demo uses #007e52 for glyphs in Light, which is `accent`. Using `accentStrong` in both modes is darker in Light and matches in Dark. That is a small deviation from the demo; confirm with Alan.

## Per decision

### 1. Secondary actions: menu behind the primary button, buttons when there is none

- With a primary button: a row with the primary `Button` and a `Menu`. The menu label is `Image(systemName: "ellipsis")` in a 44 × 44 pt frame with `.accessibilityLabel("More actions")`. Rows are `Button` with `Label("Can't attend", systemImage: "calendar.badge.minus")`. A system `Menu` places the symbol on the trailing side by itself, which is what the design shows; do not reposition it.
- With no primary button: two `Button`s in an `HStack`, `.buttonStyle(.bordered)`, minimum 44 pt tall, symbol leading (`Label` in a button puts it leading).
- Fully done assignment: render neither.
- Dynamic Type: the menu keeps the header the same height at any text size, which was the point of choosing it. Check the two-button row at the largest accessibility sizes; if the labels wrap, switch the `HStack` to a `VStack` with `ViewThatFits`.
- Open question: should Can't attend use `role: .destructive`? The design does not say. The system would colour it red.

### 2. Header collapses on scroll

Put the type and status row inside the scroll content, and the primary row and the Details / Notes / Schedule control in a pinned section header:

```swift
ScrollView {
    LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
        TypeAndStatusRow(assignment)            // scrolls away
        Section {
            tabContent                          // Details, Notes or Schedule
        } header: {
            PrimaryRow(assignment)              // primary button + More
            TabPicker(selection: $tab)          // pinned with it
        }
    }
}
```

The demo's collapse is a static state; here it is simply the scroll position, so no extra code is needed. The pinned header needs an opaque background (`Color.Brand.background`), otherwise content shows through it. Put the tab control in the pinned header, not in a `TabView`: the design's tabs switch views within one assignment.

### 3. Icons on secondary actions

Use the real SF Symbols: `calendar.badge.minus` (Can't attend), `exclamationmark.octagon` (Report issue), `clock` (Timesheet). The demo's icons are look-alike SVGs. Use `Label("…", systemImage: "…")` so VoiceOver reads the title and ignores the symbol. Check the symbol names exist in your minimum iOS version with the SF Symbols app.

### 4. Add note first on the Notes tab

A normal `Button` above the list, shown only when the person is a lead photographer. No explanatory line for everyone else (the decision accepts this). Minimum height 44 pt.

### 5 and 6. Demo-only changes

Section headings removed and the map icon on the Location row are demo-to-Figma matches. In SwiftUI the Location row is a `Button` containing a `Label` with `Image(systemName: "map")` in `accentStrong`, and the subtitle "Location · opens Maps". The demo shows a map picker; the native app should hand off to Apple Maps (`MKMapItem.openInMaps`). Confirm with the PRD owner before building a custom picker.

### 7. Bordered button contrast

Use `.buttonStyle(.bordered)` with `.tint(Color.Brand.accentStrong)` and do not rebuild the translucent fills from Figma (24% → 16% in Dark, 12% → 8% in Light). Those were overrides on two proposal buttons. The system draws its own tint, so the real contrast has to be measured on a device in Light and Dark with Accessibility Inspector. The label colour is what matters; `accentStrong` on the system fill should pass, but this is unmeasured.

### 8. White label on the green primary button

`.buttonStyle(.borderedProminent)` with `.tint(Color.Brand.accent)` and `.foregroundStyle(Color.Brand.onAccent)`. In this repo `OnAccent` is already white in every appearance, so the black label in Figma Dark came from the Figma library's own token, not from these files. Nothing to override in code.

**Problem found while writing this:** in Dark with Increase Contrast, `accent` becomes #6EC6A0 and `OnAccent` stays white. White on #6EC6A0 is **2.05:1**, which fails. The fix is in the tokens, not in Swift: set `OnAccent` to a dark value (for example #11182c, 8.61:1) for Dark + Increase Contrast, rebuild with `npm run tokens`, and check the primary button in that setting. This has not been changed yet.

### 9. Back, previous and next: no fill, accent glyphs

- **Previous and next:** `Button` with `Image(systemName: "chevron.up")` / `"chevron.down"`, `.foregroundStyle(Color.Brand.accentStrong)`, `.frame(minWidth: 44, minHeight: 44)`, `.accessibilityLabel("Previous assignment")` / `"Next assignment"`. `.disabled(true)` dims them automatically on the first and last assignment, as in the design.
- **More button:** a plain circle in Dark (#656875 in the demo) is not a token. Try `Menu` with `.buttonStyle(.bordered)` and `.buttonBorderShape(.circle)` first; if the system fill is too faint in Dark, add a token for it in Figma rather than a hex in code.
- **Back button:** the demo removes the glass from every toolbar back button. On iOS 26 and later, `ToolbarItem(...).sharedBackgroundVisibility(.hidden)` removes the glass behind a toolbar item. The system back button is different: hiding it (`.navigationBarBackButtonHidden(true)`) and drawing your own loses the swipe-back gesture unless you restore it, and loses some VoiceOver behaviour. Recommendation: keep the system back button first, and treat the plain style as a design intent to test. Wrap anything iOS 26 only in `if #available(iOS 26, *)`.

## What does not carry over

- Figma overrides that are not token-bound: the glyph colours, the 24 / 16 / 12 / 8% fills, the solid More fill, the 68 white labels.
- Look-alike SVG icons in the demo.
- The demo's "Jump to" selector, phone frame, "View full screen", Light / Dark switch and `#dark` hash.
- The phone-size measurements (874 pt screen, 218 pt pinned header). They come from one frame size; native layouts use safe areas and Dynamic Type.

## Open checks before building

1. Minimum iOS version. CI type-checks the generated Swift for iOS 17 (`check-ios`), while the Figma kit is iOS 27 Builder. Features marked iOS 26+ above need availability checks, or a decision to raise the target.
2. Whether `.borderedProminent` keeps a white label in Dark and in Increase Contrast, or whether the system picks its own label colour. Setting `.foregroundStyle(Color.Brand.onAccent)` removes the doubt.
3. The `OnAccent` fix for Dark + Increase Contrast (decision 8).
4. `accentStrong` instead of `accent` for glyphs (confirm with Alan).
5. Back button approach (decision 9).
6. Dynamic Type at the largest accessibility sizes for the primary row, the two-button row and the pinned header. Not tested in the demo or Figma.
7. VoiceOver order and labels for the header (primary row, More menu, tabs). Not tested.
8. Run the Figma-to-SwiftUI audit on the Assignment Details frame to list any system chrome (toolbar, tab bar, alerts) that Figma draws by hand.

## Where this file is linked from

`HANDOFF.md` (Screens in scope), `README.md` (file table) and the Design Decisions page (a SwiftUI line on each change).
