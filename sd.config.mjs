// Builds design tokens from tokens/tokens.json (pushed by Tokens Studio).
//
//   web/src/tokens.css, tokens-dark.css   every value, for the Vercel demo
//   ios/DesignSystem/*.swift              SwiftUI: system colours as references,
//                                         text styles as Dynamic Type fonts
//   ios/Assets.xcassets                   the brand's own colours: light, dark and
//                                         Increase Contrast variants, plus AccentColor
//                                         (the app tint, from color.accent)
//   ios/DesignSystem/kit-tokens.json      manifest: token -> class -> Swift
//
// Which colours iOS owns is set in ios-system-map.json. Those are never copied
// as hex, so the app keeps matching iOS when Apple adjusts its system colours.
//
// Tokens Studio stores each Figma collection + mode as a "set", e.g.
// "Primitives/Default", "Brand/Light", "Brand/Dark". Sets whose name contains
// "dark" become the dark theme; every other set is shared.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, rmSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const raw = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
const map = JSON.parse(readFileSync('ios-system-map.json', 'utf8'));
const order = raw.$metadata?.tokenSetOrder ?? Object.keys(raw);
const sets = order.filter((k) => !k.startsWith('$') && raw[k] && typeof raw[k] === 'object');
const isDark = (n) => /dark/i.test(n);
const isLight = (n) => /light/i.test(n);

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !('value' in v) && !('$value' in v)) {
      target[k] = deepMerge(target[k] ?? {}, v);
    } else target[k] = v;
  }
  return target;
}
const merge = (names) => names.reduce((acc, n) => deepMerge(acc, structuredClone(raw[n])), {});
const lightTokens = merge(sets.filter((s) => !isDark(s)));
const darkTokens = sets.some(isDark) ? merge(sets.filter((s) => !isLight(s))) : null;

const newSD = (tokens, platforms) =>
  new StyleDictionary({ tokens, preprocessors: ['tokens-studio'], log: { warnings: 'disabled', verbosity: 'silent' }, platforms });

// ---------- Web: CSS variables for the Vercel demo ----------
const css = (selector, file) => ({
  css: { transformGroup: 'tokens-studio', transforms: ['name/kebab'], buildPath: 'web/src/',
         files: [{ destination: file, format: 'css/variables', options: { selector, outputReferences: false } }] },
});
await newSD(lightTokens, css(':root, [data-mode="light"]', 'tokens.css')).buildAllPlatforms();
if (darkTokens) await newSD(darkTokens, css('[data-mode="dark"]', 'tokens-dark.css')).buildAllPlatforms();

// ---------- iOS: resolve values, then write SwiftUI by hand ----------
const resolve = async (tokens) => {
  const sd = newSD(tokens, { raw: { transformGroup: 'tokens-studio', transforms: ['name/kebab'] } });
  const { allTokens } = await sd.getPlatformTokens('raw');
  return new Map(allTokens.map((t) => [t.path.join('.'), t]));
};
const light = await resolve(lightTokens);
const dark = darkTokens ? await resolve(darkTokens) : light;

const typeOf = (t) => t.$type ?? t.type;
const valueOf = (t) => t?.$value ?? t?.value;
const descOf = (t) => String(t.$description ?? t.description ?? '');
const camel = (parts) => parts.join('-').split(/[^A-Za-z0-9]+/).filter(Boolean)
  .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w[0].toLowerCase() + w.slice(1))).join('');
const pascal = (parts) => { const c = camel(parts); return c[0].toUpperCase() + c.slice(1); };
const num = (v) => parseFloat(String(v));

function rgba(v) {
  let s = String(v).trim();
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(num);
    return { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p[3] ?? 1 };
  }
  throw new Error(`Unrecognised colour value: ${s}`);
}

// WCAG 2 contrast.
const lin = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const lum = (v) => { const { r, g, b } = rgba(v); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// OKLCH, to change a colour's lightness while keeping its hue.
const gam = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
function toOklch(v) {
  const { r, g, b } = rgba(v); const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, Bb), h: Math.atan2(Bb, A) };
}
function fromOklch({ L, C, h }) {
  for (let c = C; c >= 0; c -= 0.002) { // reduce chroma until the colour fits in sRGB
    const A = c * Math.cos(h), B = c * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(gam);
    if (rgb.every((x) => x >= -0.0005 && x <= 1.0005))
      return '#' + rgb.map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  return L > 0.5 ? '#FFFFFF' : '#000000';
}

// Increase Contrast variant: 1.5x the colour's weakest contrast against the mode's
// backgrounds and surfaces, at least 7:1 and at most 10:1. Colours already at 7:1 keep their value.
function highContrast(value, bgs) {
  const { a } = rgba(value);
  const worst = bgs.reduce((w, b) => (contrast(value, b) < contrast(value, w) ? b : w), bgs[0]);
  const base = contrast(value, worst);
  if (a < 1 || base >= 7) return value;
  const target = Math.min(Math.max(7.1, base * 1.5), 10);
  const o = toOklch(value);
  const darker = lum(value) < lum(worst);
  let lo = darker ? 0 : o.L, hi = darker ? o.L : 1, best = null;
  for (let i = 0; i < 40; i++) { // binary search on lightness
    const mid = (lo + hi) / 2, hex = fromOklch({ ...o, L: mid });
    const ok = contrast(hex, worst) >= target;
    if (ok) { best = hex; if (darker) lo = mid; else hi = mid; } else if (darker) hi = mid; else lo = mid;
  }
  return best ?? (darker ? '#000000' : '#FFFFFF');
}
// Every background and surface colour of a mode (falls back to white / black).
const surfacesOf = (map, fallback) => {
  const vals = [...map].filter(([k, t]) => typeOf(t) === 'color' && /^color\.(background|surface)/.test(k)).map(([, t]) => valueOf(t)).filter((v) => rgba(v).a === 1);
  return vals.length ? vals : [fallback];
};
const lightSurfaces = surfacesOf(light, '#ffffff');
const darkSurfaces = surfacesOf(dark, '#000000');
const isNeutral = (parts) => /^(background|surface|separator)/.test(parts[0]);
const hcCss = { light: [], dark: [] };

// Classify colours (rules from the design-tokens skill).
function classify(key, t) {
  const d = descOf(t);
  if (/not a public SDK colou?r/i.test(d)) return { cls: 'own' };
  if (/UIVibrancyEffectStyle/.test(d)) return { cls: 'vibrancy' };
  if (map.colors[key]) return { cls: 'sdk', swift: map.colors[key] };
  let m = d.match(/SwiftUI\s+(Color\.[A-Za-z0-9]+)/);
  if (m) return { cls: 'sdk', swift: m[1] };
  m = d.match(/UIKit\s+UIColor\.([A-Za-z0-9]+)/);
  if (m) return { cls: 'sdk', swift: `Color(uiColor: .${m[1]})` };
  return { cls: 'own' };
}

const out = 'ios/DesignSystem';
const assets = 'ios/Assets.xcassets';
rmSync(out, { recursive: true, force: true });
rmSync(assets, { recursive: true, force: true });
rmSync('ios/BrandTokens.swift', { force: true });
rmSync('ios/BrandTokensDark.swift', { force: true });
mkdirSync(out, { recursive: true });
mkdirSync(assets, { recursive: true });
writeFileSync(`${assets}/Contents.json`, JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2) + '\n');

const header = '// Generated from tokens/tokens.json by `npm run tokens`. Do not edit by hand.\n';
const manifest = [];
const ids = new Map();
const exprs = new Map();
const claim = (id, key) => {
  if (ids.has(id)) throw new Error(`Two tokens produce the Swift name "${id}": ${ids.get(id)} and ${key}`);
  ids.set(id, key);
};

// Colours
const colorLines = [];
for (const [key, t] of light) {
  if (typeOf(t) !== 'color') continue;
  const parts = t.path[0] === 'color' ? t.path.slice(1) : t.path;
  const id = camel(parts);
  claim(`Color.${id}`, key);
  const c = classify(key, t);
  if (c.cls === 'vibrancy') {
    colorLines.push(`    // ${id}: a UIVibrancyEffect style, not a colour. Apply with UIVibrancyEffect(blurEffect:style:).`);
    manifest.push({ token: key, class: 'vibrancy' });
    continue;
  }
  if (c.cls === 'sdk') {
    if (exprs.has(c.swift)) console.warn(`Note: ${key} and ${exprs.get(c.swift)} both emit ${c.swift}`);
    exprs.set(c.swift, key);
    colorLines.push(`    /// System-owned: follows iOS in light, dark and future releases. Design value ${valueOf(t)}.`);
    colorLines.push(`    static let ${id} = ${c.swift}`);
    manifest.push({ token: key, class: 'sdk', swift: c.swift });
    continue;
  }
  const name = pascal(parts);
  const comps = (v) => {
    const { r, g, b, a } = rgba(v);
    const f = (x) => x.toFixed(3);
    return { 'color-space': 'srgb', components: { red: f(r), green: f(g), blue: f(b), alpha: f(a) } };
  };
  const darkVal = valueOf(dark.get(key)) ?? valueOf(t);
  // Increase Contrast (Settings > Accessibility): stronger variants against the mode's background.
  // "on-" colours (text on a fill) keep their value; the fill under them gets stronger instead.
  const onColor = /^on-/.test(parts[parts.length - 1]);
  const keep = onColor || isNeutral(parts);
  const hcLight = keep ? valueOf(t) : highContrast(valueOf(t), lightSurfaces);
  const hcDark = keep ? darkVal : highContrast(darkVal, darkSurfaces);
  const colors = [
    { idiom: 'universal', color: comps(valueOf(t)) },
    { idiom: 'universal', appearances: [{ appearance: 'contrast', value: 'high' }], color: comps(hcLight) },
  ];
  if (darkTokens) {
    colors.push({ idiom: 'universal', appearances: [{ appearance: 'luminosity', value: 'dark' }], color: comps(darkVal) });
    colors.push({ idiom: 'universal', appearances: [{ appearance: 'luminosity', value: 'dark' }, { appearance: 'contrast', value: 'high' }], color: comps(hcDark) });
  }
  const colorset = JSON.stringify({ colors, info: { author: 'xcode', version: 1 } }, null, 2) + '\n';
  mkdirSync(`${assets}/${name}.colorset`, { recursive: true });
  writeFileSync(`${assets}/${name}.colorset/Contents.json`, colorset);
  // The app-wide tint: Xcode applies the AccentColor asset to every control automatically.
  if (key === 'color.accent') {
    mkdirSync(`${assets}/AccentColor.colorset`, { recursive: true });
    writeFileSync(`${assets}/AccentColor.colorset/Contents.json`, colorset);
  }
  if (hcLight !== valueOf(t)) hcCss.light.push(`    --${t.name}: ${hcLight};`);
  if (darkTokens && hcDark !== darkVal) hcCss.dark.push(`    --${t.name}: ${hcDark};`);
  colorLines.push(`    /// Brand-owned. Light ${valueOf(t)}${darkTokens ? `, dark ${darkVal}` : ''}. Increase Contrast: ${hcLight}${darkTokens ? ` / ${hcDark}` : ''}.`);
  colorLines.push(`    static let ${id} = Color("${name}")`);
  manifest.push({ token: key, class: 'own', swift: `Color("${name}")`, colorset: `Assets.xcassets/${name}.colorset`, light: valueOf(t), dark: darkVal, highContrastLight: hcLight, highContrastDark: hcDark });
}
if (!light.has('color.accent')) console.warn('Note: no color.accent token, so no AccentColor asset was written.');
else colorLines.push('    // Assets.xcassets/AccentColor is the app tint (same values as accent). Xcode uses it for every control.');
// Web: the same stronger values when the browser asks for more contrast.
// The web gets the same stronger values; see the web section at the end.
writeFileSync(`${out}/Colors.swift`, `${header}import SwiftUI\nimport UIKit\n\nextension Color {\n    enum Brand {\n${colorLines.map((l) => '    ' + l).join('\n')}\n    }\n}\n`);

// Typography: Dynamic Type text styles, never fixed sizes for the system font.
const families = {};
for (const [key, t] of light) if (t.path[0] === 'font' && /^family/.test(t.path[1] ?? '')) families[t.path[1]] = String(valueOf(t)).replace(/^['"]|['"]$/g, '');
const isSystem = (f) => !f || map.systemFontFamilies.some((s) => f.toLowerCase().startsWith(s.toLowerCase()));
const weightName = (w) => ({ 100: 'ultraLight', 200: 'thin', 300: 'light', 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'heavy', 900: 'black' })[Math.round(num(w) / 100) * 100] ?? 'regular';
const styles = new Map();
for (const [key, t] of light) {
  if (t.path[0] !== 'type' || t.path.length < 3) continue;
  const base = t.path.slice(0, 2).join('.');
  if (!styles.has(base)) styles.set(base, {});
  styles.get(base)[t.path[2]] = valueOf(t);
}
const typeLines = [];
const trackLines = [];
for (const [base, s] of styles) {
  const style = map.textStyles[base];
  const id = camel([base.split('.')[1]]);
  claim(`Font.${id}`, base);
  const isDisplay = /title/.test(base);
  const family = families[isDisplay ? 'family-display' : 'family-body'] ?? families['family-body'];
  const weight = s.weight !== undefined ? `.weight(.${weightName(s.weight)})` : '';
  let expr;
  if (!style) {
    expr = `Font.system(size: ${num(s.size)})${weight}`;
    typeLines.push(`    /// No matching iOS text style; this one will not scale with Dynamic Type. Add it to ios-system-map.json.`);
  } else if (isSystem(family)) {
    expr = `Font.${style}${weight}`;
    typeLines.push(`    /// iOS .${style}: design size ${num(s.size)} pt at the default text size; scales with Dynamic Type.`);
  } else {
    expr = `Font.custom("${family}", size: ${num(s.size)}, relativeTo: .${style})${weight}`;
    typeLines.push(`    /// ${family} sized like .${style}; scales with Dynamic Type. Use the font's PostScript name if it differs.`);
  }
  typeLines.push(`    static let ${id} = ${expr}`);
  trackLines.push(`    static let ${id}: CGFloat = ${num(s.tracking ?? 0)}`);
  manifest.push({ token: base, class: style ? 'textStyle' : 'fixedSize', swift: expr });
}
writeFileSync(`${out}/Typography.swift`, `${header}import SwiftUI\n\nextension Font {\n    enum Brand {\n${typeLines.map((l) => '    ' + l).join('\n')}\n    }\n}\n\n/// Letter spacing per text style, in points. Apply with .tracking(Tracking.body).\nenum Tracking {\n${trackLines.join('\n')}\n}\n`);

// Spacing and radius: brand-owned plain numbers.
const numberEnum = (group, label) => {
  const lines = [];
  for (const [key, t] of light) {
    if (t.path[0] !== group || t.path.length !== 2) continue;
    const id = camel([t.path[1]]);
    claim(`${label}.${id}`, key);
    lines.push(`    static let ${id}: CGFloat = ${num(valueOf(t))}`);
    manifest.push({ token: key, class: 'own', swift: `${label}.${id}`, value: num(valueOf(t)) });
  }
  return `enum ${label} {\n${lines.join('\n')}\n}\n`;
};
writeFileSync(`${out}/Spacing.swift`, `${header}import CoreGraphics\n\n${numberEnum('space', 'Spacing')}\n${numberEnum('radius', 'Radius')}`);
writeFileSync(`${out}/kit-tokens.json`, JSON.stringify(manifest, null, 2) + '\n');

const count = (c) => manifest.filter((m) => m.class === c).length;
console.log(`Built tokens from ${sets.length} set(s)${darkTokens ? ' with a dark theme' : ''}: ` +
  `${count('sdk')} system colours, ${manifest.filter((m) => m.colorset).length} brand colours, ` +
  `${count('textStyle')} Dynamic Type styles, ${count('fixedSize')} fixed-size styles.`);

// ---------- Web: dark mode, contrast, fonts, Tailwind ----------
// System font stack: SF Pro is licensed for Apple platforms only, so the web
// asks for the device's own system font (SF on Apple devices).
const STACK = `-apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
const webFamily = (f) => (isSystem(f) ? STACK : `'${f}', ${STACK}`);
function webify(file) {
  let s = readFileSync(file, 'utf8');
  s = s.replace(/(--font-family-[\w-]+): ['"]?([^;'"]+?)['"]?;/g, (_, k, f) => `${k}: ${webFamily(f.trim())};`);
  s = s.replace(/(--type-[\w-]+-(?:line-height|tracking)): (-?[\d.]+);/g, '$1: $2px;');
  writeFileSync(file, s);
}
webify('web/src/tokens.css');
const block = (sel, lines) => `  ${sel} {\n${lines.join('\n')}\n  }`;
if (hcCss.light.length)
  appendFileSync('web/src/tokens.css', `\n@media (prefers-contrast: more) {\n${block(':root, [data-mode="light"]', hcCss.light)}\n}\n`);
if (darkTokens) {
  webify('web/src/tokens-dark.css');
  const darkLines = readFileSync('web/src/tokens-dark.css', 'utf8').match(/\{\n([\s\S]*?)\n\}/)[1].split('\n').map((l) => '  ' + l);
  let extra = `\n/* Follow the visitor's system setting unless the page sets data-mode="light". */\n` +
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-mode="light"])', darkLines)}\n}\n`;
  if (hcCss.dark.length) extra += `\n@media (prefers-contrast: more) {\n${block('[data-mode="dark"]', hcCss.dark)}\n}\n` +
    `\n@media (prefers-color-scheme: dark) and (prefers-contrast: more) {\n${block(':root:not([data-mode="light"])', hcCss.dark)}\n}\n`;
  appendFileSync('web/src/tokens-dark.css', extra);
}

// Brand fonts for the web: Google Fonts import for every non-system family.
const webFonts = [...new Set(Object.values(families))].filter((f) => !isSystem(f));
writeFileSync('web/src/fonts.css', `/* Generated by \`npm run tokens\`. Loads the brand fonts from Google Fonts. If a font is not on\n   Google Fonts, self-host it with @font-face instead. */\n` +
  webFonts.map((f) => `@import url('https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@400;500;600;700&display=swap');`).join('\n') + '\n');

// Tailwind: a preset that points every utility at the CSS variables, so light, dark and
// Increase Contrast switch automatically. Tailwind 3: presets: [preset]. Tailwind 4: @config.
const tw = { colors: {}, spacing: {}, borderRadius: {}, fontFamily: {}, fontSize: {} };
for (const [key, t] of light) {
  const v = `var(--${t.name})`;
  if (typeOf(t) === 'color') tw.colors[(t.path[0] === 'color' ? t.path.slice(1) : t.path).join('-')] = v;
  else if (t.path[0] === 'space' && t.path.length === 2) tw.spacing[t.path[1]] = v;
  else if (t.path[0] === 'radius' && t.path.length === 2) tw.borderRadius[t.path[1]] = v;
  else if (t.path[0] === 'font' && /^family-/.test(t.path[1] ?? '')) tw.fontFamily[t.path[1].replace(/^family-/, '')] = [v];
}
for (const [base] of styles) {
  const n = base.split('.')[1];
  tw.fontSize[n] = [`var(--type-${n}-size)`, { lineHeight: `var(--type-${n}-line-height)`, letterSpacing: `var(--type-${n}-tracking)`, fontWeight: `var(--type-${n}-weight)` }];
}
writeFileSync('web/tailwind.preset.js', `// Generated from tokens/tokens.json by \`npm run tokens\`. Do not edit by hand.\n` +
  `// Load web/src/fonts.css, web/src/tokens.css and web/src/tokens-dark.css on the page, then:\n` +
  `//   Tailwind 3: tailwind.config.js -> presets: [require('./tailwind.preset.js')] or import it\n` +
  `//   Tailwind 4: @config "./tailwind.preset.js"; in your CSS\n` +
  `// Classes such as bg-accent, text-text-primary, p-md, rounded-lg, font-display, text-body follow\n` +
  `// light, dark and Increase Contrast automatically, so no dark: variants are needed for colour.\n` +
  `export default ${JSON.stringify({ theme: { extend: tw } }, null, 2)};\n`);

