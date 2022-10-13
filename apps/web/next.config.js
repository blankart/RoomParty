const withTM = require("next-transpile-modules")(["@RoomParty/shared-lib"]);
const { withSuperjson } = require("next-superjson");
const withPWA = require("next-pwa");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// module.exports = withTM({
//   reactStrictMode: true,
// });

module.exports = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(
  withBundleAnalyzer(
    withTM(
      withSuperjson()({
        // reactStrictMode: true,
        pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
        typescript: {
          ignoreBuildErrors: true,
        },
      })
    )
  )
);
