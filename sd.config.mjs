// Builds design tokens from tokens/tokens.json (pushed by Tokens Studio)
// into web/src/tokens.css (Vercel demo) and ios/BrandTokens*.swift (Xcode).
//
// Tokens Studio stores each Figma collection + mode as a "set", e.g.
// "Primitives/Default", "Brand/Light", "Brand/Dark". Sets whose name
// contains "dark" become the dark theme; every other set is shared.
import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

// iOS points are 1:1 with Figma pixels, so numbers pass through unchanged
// (the stock ios transforms would treat them as rem and multiply by 16).
StyleDictionary.registerTransform({
  name: 'brand/swift/cgfloat',
  type: 'value',
  filter: (t) => ['dimension', 'spacing', 'sizing', 'borderRadius', 'fontSizes', 'fontSize'].includes(t.$type ?? t.type),
  transform: (t) => `CGFloat(${parseFloat(t.$value ?? t.value)})`,
});
StyleDictionary.registerTransform({
  name: 'brand/swift/string',
  type: 'value',
  filter: (t) => ['fontFamilies', 'fontFamily', 'string'].includes(t.$type ?? t.type),
  transform: (t) => JSON.stringify(String(t.$value ?? t.value)),
});

const raw = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
const order = raw.$metadata?.tokenSetOrder ?? Object.keys(raw);
const sets = order.filter((k) => !k.startsWith('$') && raw[k] && typeof raw[k] === 'object');

const isDark = (name) => /dark/i.test(name);
const isLight = (name) => /light/i.test(name);

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !('value' in v) && !('$value' in v)) {
      target[k] = deepMerge(target[k] ?? {}, v);
    } else {
      target[k] = v;
    }
  }
  return target;
}
const merge = (names) => names.reduce((acc, n) => deepMerge(acc, structuredClone(raw[n])), {});

const lightTokens = merge(sets.filter((s) => !isDark(s)));
const darkSets = sets.filter(isDark);
const darkTokens = darkSets.length ? merge(sets.filter((s) => !isLight(s))) : null;

// Swift: nest names like BrandTokens.colorAccent -> keep flat camelCase for simplicity.
function build(tokens, { cssSelector, cssFile, swiftClass }) {
  return new StyleDictionary({
    tokens,
    preprocessors: ['tokens-studio'],
    log: { warnings: 'disabled', verbosity: 'silent' },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab'],
        buildPath: 'web/src/',
        files: [{ destination: cssFile, format: 'css/variables', options: { selector: cssSelector, outputReferences: false } }],
      },
      ios: {
        transforms: ['attribute/cti', 'name/camel', 'color/UIColorSwift', 'brand/swift/cgfloat', 'brand/swift/string'],
        buildPath: 'ios/',
        files: [{ destination: `${swiftClass}.swift`, format: 'ios-swift/class.swift', options: { className: swiftClass, import: ['UIKit'] } }],
      },
    },
  });
}

const light = build(lightTokens, { cssSelector: ':root', cssFile: 'tokens.css', swiftClass: 'BrandTokens' });
await light.cleanAllPlatforms();
await light.buildAllPlatforms();

if (darkTokens) {
  const dark = build(darkTokens, { cssSelector: '[data-mode="dark"]', cssFile: 'tokens-dark.css', swiftClass: 'BrandTokensDark' });
  await dark.buildAllPlatforms();
}

console.log(`Built tokens from ${sets.length} set(s)${darkTokens ? ' with a dark theme' : ''}.`);
