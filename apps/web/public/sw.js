if (!self.define) {
  let e,
    s = {};
  const i = (i, c) => (
    (i = new URL(i + ".js", c).href),
    s[i] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = i), (e.onload = s), document.head.appendChild(e);
        } else (e = i), importScripts(i), s();
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, n) => {
    const a =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[a]) return;
    let t = {};
    const r = (e) => i(e, a),
      f = { module: { uri: a }, exports: t, require: r };
    s[a] = Promise.all(c.map((e) => f[e] || r(e))).then((e) => (n(...e), t));
  };
}
define(["./workbox-c5ed321c"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/-4-vWBWjOo756foQPBHN2/_buildManifest.js",
          revision: "e92685402f1e6d9ee518254b39bc2227",
        },
        {
          url: "/_next/static/-4-vWBWjOo756foQPBHN2/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/163.d6ffccd1d62bd05a.js",
          revision: "d6ffccd1d62bd05a",
        },
        {
          url: "/_next/static/chunks/164-e7c326097adc6e76.js",
          revision: "e7c326097adc6e76",
        },
        {
          url: "/_next/static/chunks/1fca4c80-19247629d83e09e8.js",
          revision: "19247629d83e09e8",
        },
        {
          url: "/_next/static/chunks/202.883601ccd8253fce.js",
          revision: "883601ccd8253fce",
        },
        {
          url: "/_next/static/chunks/246.a70faa2934b9a63b.js",
          revision: "a70faa2934b9a63b",
        },
        {
          url: "/_next/static/chunks/305.e11ca2b69f1f23ca.js",
          revision: "e11ca2b69f1f23ca",
        },
        {
          url: "/_next/static/chunks/319.87b82b5a22f5999c.js",
          revision: "87b82b5a22f5999c",
        },
        {
          url: "/_next/static/chunks/430-2a8749b8e57ae274.js",
          revision: "2a8749b8e57ae274",
        },
        {
          url: "/_next/static/chunks/44.825b15c49f0e0873.js",
          revision: "825b15c49f0e0873",
        },
        {
          url: "/_next/static/chunks/470.7df378093551617b.js",
          revision: "7df378093551617b",
        },
        {
          url: "/_next/static/chunks/488.25a3dbbc95733612.js",
          revision: "25a3dbbc95733612",
        },
        {
          url: "/_next/static/chunks/491.d0fc0b0f61e308c5.js",
          revision: "d0fc0b0f61e308c5",
        },
        {
          url: "/_next/static/chunks/526.293862f6a7714662.js",
          revision: "293862f6a7714662",
        },
        {
          url: "/_next/static/chunks/56.3049bfb54db21a24.js",
          revision: "3049bfb54db21a24",
        },
        {
          url: "/_next/static/chunks/596.0e7732126be259d7.js",
          revision: "0e7732126be259d7",
        },
        {
          url: "/_next/static/chunks/59b4e022-e2f312b99b90b6b0.js",
          revision: "e2f312b99b90b6b0",
        },
        {
          url: "/_next/static/chunks/625.b12c1c288148cedd.js",
          revision: "b12c1c288148cedd",
        },
        {
          url: "/_next/static/chunks/645.6bdc42ecf28d1ab7.js",
          revision: "6bdc42ecf28d1ab7",
        },
        {
          url: "/_next/static/chunks/671.2d200695e2eebc1c.js",
          revision: "2d200695e2eebc1c",
        },
        {
          url: "/_next/static/chunks/72585f70-64920f78d7cba1ec.js",
          revision: "64920f78d7cba1ec",
        },
        {
          url: "/_next/static/chunks/740.78001b4205f2dfbb.js",
          revision: "78001b4205f2dfbb",
        },
        {
          url: "/_next/static/chunks/854.6114637bb28b6bfc.js",
          revision: "6114637bb28b6bfc",
        },
        {
          url: "/_next/static/chunks/86.12ad08b597837d97.js",
          revision: "12ad08b597837d97",
        },
        {
          url: "/_next/static/chunks/862-03ffbcf17786970e.js",
          revision: "03ffbcf17786970e",
        },
        {
          url: "/_next/static/chunks/865.ab7d5636b6446ef7.js",
          revision: "ab7d5636b6446ef7",
        },
        {
          url: "/_next/static/chunks/893.b29933bf48adcb77.js",
          revision: "b29933bf48adcb77",
        },
        {
          url: "/_next/static/chunks/927.91ff0c639cf6a4f7.js",
          revision: "91ff0c639cf6a4f7",
        },
        {
          url: "/_next/static/chunks/960.7b8a3757f788831b.js",
          revision: "7b8a3757f788831b",
        },
        {
          url: "/_next/static/chunks/982.d197437535a46754.js",
          revision: "d197437535a46754",
        },
        {
          url: "/_next/static/chunks/framework-c02f198d58d34563.js",
          revision: "c02f198d58d34563",
        },
        {
          url: "/_next/static/chunks/main-847218df69fdb88c.js",
          revision: "847218df69fdb88c",
        },
        {
          url: "/_next/static/chunks/pages/_app-c6f54a6b601461cf.js",
          revision: "c6f54a6b601461cf",
        },
        {
          url: "/_next/static/chunks/pages/_error-e755336071b61fcc.js",
          revision: "e755336071b61fcc",
        },
        {
          url: "/_next/static/chunks/pages/index-f97722d3eca266b2.js",
          revision: "f97722d3eca266b2",
        },
        {
          url: "/_next/static/chunks/pages/privacy-policy-488f609500b7c42f.js",
          revision: "488f609500b7c42f",
        },
        {
          url: "/_next/static/chunks/pages/rooms-c19751c0f1c0c459.js",
          revision: "c19751c0f1c0c459",
        },
        {
          url: "/_next/static/chunks/pages/rooms/%5BroomIdentificationId%5D-a879661dd626fa83.js",
          revision: "a879661dd626fa83",
        },
        {
          url: "/_next/static/chunks/pages/sign-in-7ba206ca048ccaef.js",
          revision: "7ba206ca048ccaef",
        },
        {
          url: "/_next/static/chunks/pages/sign-up-88aaf30a7d38783e.js",
          revision: "88aaf30a7d38783e",
        },
        {
          url: "/_next/static/chunks/pages/terms-and-conditions-b2edb239dbd0493e.js",
          revision: "b2edb239dbd0493e",
        },
        {
          url: "/_next/static/chunks/pages/user-settings-0d1e7c679d747fce.js",
          revision: "0d1e7c679d747fce",
        },
        {
          url: "/_next/static/chunks/pages/verification-code-423f82938cbc5e99.js",
          revision: "423f82938cbc5e99",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-ee30de9ac50a998b.js",
          revision: "ee30de9ac50a998b",
        },
        {
          url: "/_next/static/css/7d0728e56a5ca628.css",
          revision: "7d0728e56a5ca628",
        },
        {
          url: "/_next/static/media/fb-icon.20600978.svg",
          revision: "8b63bfccdc4473c54a4d7d8be4228c56",
        },
        {
          url: "/_next/static/media/mixcloud-icon.e891a16a.png",
          revision: "e4b87e3079acd030d9eb4e1571abf2f0",
        },
        {
          url: "/_next/static/media/soundcloud-icon.5fb2a5fb.png",
          revision: "74aab0472c3f0266230023dfa46e7a92",
        },
        {
          url: "/_next/static/media/thumbnail.cc052ff4.png",
          revision: "59041f755a809401894b5f29e8dc7064",
        },
        {
          url: "/_next/static/media/twitch-icon.6ff753b3.svg",
          revision: "127702fafb9b01f02d00beec1e37e956",
        },
        {
          url: "/_next/static/media/vimeo-icon.d9d55fca.svg",
          revision: "4c43c9dc38d4f08c776115068af25ec6",
        },
        {
          url: "/_next/static/media/yt-icon.4cd3e638.png",
          revision: "4fb19dfed7343221aee6f4d9e9d9f5ea",
        },
        {
          url: "/android-icon-144x144.png",
          revision: "77fceaa23ed422930d1f9d21080f9aaa",
        },
        {
          url: "/android-icon-192x192.png",
          revision: "a1e09097954fb47bf5699d47c4ed877a",
        },
        {
          url: "/android-icon-36x36.png",
          revision: "41f4640935af42aab520b7a99db1bc26",
        },
        {
          url: "/android-icon-48x48.png",
          revision: "98fa9b00065c20088fa9de68b43f57f9",
        },
        {
          url: "/android-icon-72x72.png",
          revision: "e704539498893b3ee01d6cc7435a60d9",
        },
        {
          url: "/android-icon-96x96.png",
          revision: "ae9288f7ba447c248f5434ad4def6018",
        },
        {
          url: "/apple-icon-114x114.png",
          revision: "d50f75aa1e1a5390e7b30f113743956d",
        },
        {
          url: "/apple-icon-120x120.png",
          revision: "22e2b4b27fb0824c099d2698a071857d",
        },
        {
          url: "/apple-icon-144x144.png",
          revision: "77fceaa23ed422930d1f9d21080f9aaa",
        },
        {
          url: "/apple-icon-152x152.png",
          revision: "8d3f3a8d615b8d8cd5fe74bf80f04044",
        },
        {
          url: "/apple-icon-180x180.png",
          revision: "f0971fbb57f51e8ef208f5615d428e9e",
        },
        {
          url: "/apple-icon-57x57.png",
          revision: "4dad96a5255883f3f90715837e757c78",
        },
        {
          url: "/apple-icon-60x60.png",
          revision: "33a90adf29713e3328d62b3e0244bd25",
        },
        {
          url: "/apple-icon-72x72.png",
          revision: "e704539498893b3ee01d6cc7435a60d9",
        },
        {
          url: "/apple-icon-76x76.png",
          revision: "19ada6ea9b1c0d78de849100841f174a",
        },
        {
          url: "/apple-icon-precomposed.png",
          revision: "43595f744b0ddb432794f95ec4a1d678",
        },
        {
          url: "/apple-icon.png",
          revision: "43595f744b0ddb432794f95ec4a1d678",
        },
        {
          url: "/browserconfig.xml",
          revision: "653d077300a12f09a69caeea7a8947f8",
        },
        {
          url: "/favicon-16x16.png",
          revision: "d750a6ff593cfa6f005930f0a3fdb7a8",
        },
        {
          url: "/favicon-32x32.png",
          revision: "958ffb5179226a85e997df8d1ab90632",
        },
        {
          url: "/favicon-96x96.png",
          revision: "ae9288f7ba447c248f5434ad4def6018",
        },
        { url: "/favicon.ico", revision: "1f010dfa88238af21f87a2187f662c3c" },
        {
          url: "/icon-192x192.png",
          revision: "c7406ca9a64b9917abf887499ba05e93",
        },
        {
          url: "/icon-256x256.png",
          revision: "45ebbd32051861006816e2325bc84f8e",
        },
        {
          url: "/icon-384x384.png",
          revision: "125e5ca27dbb695bff85ab12ae8a0137",
        },
        {
          url: "/icon-512x512.png",
          revision: "0996967ac3f97f325d57f36cd2ff4998",
        },
        { url: "/images/bg.mp4", revision: "5cbbc604eed357cac49d170af1c917d1" },
        {
          url: "/images/fb-icon.svg",
          revision: "8b63bfccdc4473c54a4d7d8be4228c56",
        },
        {
          url: "/images/interface.png",
          revision: "a5f41437a2b6716697a9fd553c95f768",
        },
        {
          url: "/images/mixcloud-icon.png",
          revision: "e4b87e3079acd030d9eb4e1571abf2f0",
        },
        {
          url: "/images/soundcloud-icon.png",
          revision: "74aab0472c3f0266230023dfa46e7a92",
        },
        {
          url: "/images/thumbnail.png",
          revision: "59041f755a809401894b5f29e8dc7064",
        },
        {
          url: "/images/twitch-icon.svg",
          revision: "127702fafb9b01f02d00beec1e37e956",
        },
        {
          url: "/images/vimeo-icon.svg",
          revision: "4c43c9dc38d4f08c776115068af25ec6",
        },
        {
          url: "/images/yt-icon.png",
          revision: "4fb19dfed7343221aee6f4d9e9d9f5ea",
        },
        {
          url: "/manifest.webmanifest",
          revision: "3daddd285e29cadcfb66c44277cb3783",
        },
        {
          url: "/ms-icon-144x144.png",
          revision: "77fceaa23ed422930d1f9d21080f9aaa",
        },
        {
          url: "/ms-icon-150x150.png",
          revision: "7720f1d2b93db9156257e798b5463a88",
        },
        {
          url: "/ms-icon-310x310.png",
          revision: "311f27c7abd2895366f9200594f0c111",
        },
        {
          url: "/ms-icon-70x70.png",
          revision: "96fd8eae83b64de9fb7871da38e2d967",
        },
        { url: "/robots.txt", revision: "cc82fea14a75a25eedc657dcbf93163e" },
        { url: "/sitemap-0.xml", revision: "258f7e57a8f8c42e3f07a085b04df8f4" },
        { url: "/sitemap.xml", revision: "1a038e687d42f8fa1f4589a2b7c06198" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: i,
              state: c,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
