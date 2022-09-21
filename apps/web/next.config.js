const withTM = require("next-transpile-modules")(['@rooms2watch/shared-lib']);
const { withSuperjson } = require("next-superjson");

// module.exports = withTM({
//   reactStrictMode: true,
// });

module.exports = withTM(withSuperjson()({
  // reactStrictMode: true,
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
})) ;
