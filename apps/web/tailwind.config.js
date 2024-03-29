/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    require("daisyui"),
  ],

  daisyui: {
    log: true,
    themes: [
      {
        halloween: {
          ...require("daisyui/src/colors/themes")["[data-theme=halloween]"],
          info: "rgb(115, 143, 255)",
        },
      },
      "cupcake",
    ],
  },
};
