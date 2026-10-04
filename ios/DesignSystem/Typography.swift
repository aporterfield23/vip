// Generated from tokens/tokens.json by `npm run tokens`. Do not edit by hand.
import SwiftUI

extension Font {
    enum Brand {
        /// Encode Sans sized like .largeTitle; scales with Dynamic Type. Use the font's PostScript name if it differs.
        static let largeTitle = Font.custom("Encode Sans", size: 34, relativeTo: .largeTitle).weight(.bold)
        /// Encode Sans sized like .title; scales with Dynamic Type. Use the font's PostScript name if it differs.
        static let title1 = Font.custom("Encode Sans", size: 28, relativeTo: .title).weight(.bold)
        /// Encode Sans sized like .title2; scales with Dynamic Type. Use the font's PostScript name if it differs.
        static let title2 = Font.custom("Encode Sans", size: 22, relativeTo: .title2).weight(.bold)
        /// Encode Sans sized like .title3; scales with Dynamic Type. Use the font's PostScript name if it differs.
        static let title3 = Font.custom("Encode Sans", size: 20, relativeTo: .title3).weight(.semibold)
        /// iOS .headline: design size 17 pt at the default text size; scales with Dynamic Type.
        static let headline = Font.headline.weight(.semibold)
        /// iOS .body: design size 17 pt at the default text size; scales with Dynamic Type.
        static let body = Font.body.weight(.regular)
        /// iOS .callout: design size 16 pt at the default text size; scales with Dynamic Type.
        static let callout = Font.callout.weight(.regular)
        /// iOS .subheadline: design size 15 pt at the default text size; scales with Dynamic Type.
        static let subheadline = Font.subheadline.weight(.regular)
        /// iOS .footnote: design size 13 pt at the default text size; scales with Dynamic Type.
        static let footnote = Font.footnote.weight(.regular)
        /// iOS .caption: design size 12 pt at the default text size; scales with Dynamic Type.
        static let caption = Font.caption.weight(.regular)
    }
}

/// Letter spacing per text style, in points. Apply with .tracking(Tracking.body).
enum Tracking {
    static let largeTitle: CGFloat = 0
    static let title1: CGFloat = 0
    static let title2: CGFloat = 0
    static let title3: CGFloat = 0
    static let headline: CGFloat = 0
    static let body: CGFloat = 0
    static let callout: CGFloat = 0
    static let subheadline: CGFloat = 0
    static let footnote: CGFloat = 0
    static let caption: CGFloat = 0
}
