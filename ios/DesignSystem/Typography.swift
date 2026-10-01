// Generated from tokens/tokens.json by `npm run tokens`. Do not edit by hand.
import SwiftUI

extension Font {
    enum Brand {
        /// iOS .largeTitle: design size 34 pt at the default text size; scales with Dynamic Type.
        static let largeTitle = Font.largeTitle.weight(.bold)
        /// iOS .title: design size 28 pt at the default text size; scales with Dynamic Type.
        static let title1 = Font.title.weight(.bold)
        /// iOS .title2: design size 22 pt at the default text size; scales with Dynamic Type.
        static let title2 = Font.title2.weight(.bold)
        /// iOS .title3: design size 20 pt at the default text size; scales with Dynamic Type.
        static let title3 = Font.title3.weight(.semibold)
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
