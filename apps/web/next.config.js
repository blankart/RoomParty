// const withTM = require("next-transpile-modules")(["ui"]);
const { withSuperjson } = require('next-superjson')

// module.exports = withTM({
//   reactStrictMode: true,
// });

module.exports = withSuperjson()({ reactStrictMode: true })
