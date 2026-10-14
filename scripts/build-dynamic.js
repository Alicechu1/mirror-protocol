// Build Dynamic SDK bundle for browser usage
// Usage: node scripts/build-dynamic.js

const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['scripts/dynamic-entry.js'],
  bundle: true,
  format: 'iife',
  globalName: 'Dynamic',
  outfile: 'demo/dynamic-sdk.bundle.js',
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'window',
  },
  sourcemap: false,
  minify: true,
  logLevel: 'info',
}).catch(() => process.exit(1));
