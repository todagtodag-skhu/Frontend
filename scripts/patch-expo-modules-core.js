const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'ios',
  'Core',
  'Views',
  'SwiftUI',
  'SwiftUIViewDefinition.swift'
);

if (!fs.existsSync(targetPath)) {
  process.exit(0);
}

const original = fs.readFileSync(targetPath, 'utf8');
const needle = '            let content = hostingUIView.getContentView()';
const replacement = `            let content = performSynchronouslyOnMainActor {\n              hostingUIView.getContentView()\n            }`;

if (original.includes(replacement)) {
  process.exit(0);
}

if (!original.includes(needle)) {
  console.error(`Expected snippet not found in ${targetPath}`);
  process.exit(1);
}

const next = original.replace(needle, replacement);
fs.writeFileSync(targetPath, next);
