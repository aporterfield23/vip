// Builds design tokens from tokens/tokens.json (pushed by Tokens Studio).
//
//   web/src/tokens.css, tokens-dark.css   every value, for the Vercel demo
//   ios/DesignSystem/*.swift              SwiftUI: system colours as references,
//                                         text styles as Dynamic Type fonts
//   ios/Assets.xcassets                   the brand's own colours, light + dark
//   ios/DesignSystem/kit-tokens.json      manifest: token -> class -> Swift
//
// Which colours iOS owns is set in ios-system-map.json. Those are never copied
// as hex, so the app keeps matching iOS when Apple adjusts its system colours.
//
// Tokens Studio stores each Figma collection + mode as a "set", e.g.
// "Primitives/Default", "Brand/Light", "Brand/Dark". Sets whose name contains
// "dark" become the dark theme; every other set is shared.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
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
await newSD(lightTokens, css(':root', 'tokens.css')).buildAllPlatforms();
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
  const colors = [{ idiom: 'universal', color: comps(valueOf(t)) }];
  if (darkTokens) colors.push({ idiom: 'universal', appearances: [{ appearance: 'luminosity', value: 'dark' }], color: comps(darkVal) });
  mkdirSync(`${assets}/${name}.colorset`, { recursive: true });
  writeFileSync(`${assets}/${name}.colorset/Contents.json`, JSON.stringify({ colors, info: { author: 'xcode', version: 1 } }, null, 2) + '\n');
  colorLines.push(`    /// Brand-owned. Light ${valueOf(t)}${darkTokens ? `, dark ${darkVal}` : ''}.`);
  colorLines.push(`    static let ${id} = Color("${name}")`);
  manifest.push({ token: key, class: 'own', swift: `Color("${name}")`, colorset: `Assets.xcassets/${name}.colorset`, light: valueOf(t), dark: darkVal });
}
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
