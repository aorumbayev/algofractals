const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        fontFamily: {
            cursive: ["Shrikhand", "Chicle", "Spicy Rice"],
        },
        extend: {
            fontFamily: {
                sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
            },
            width: {
                600: "600px",
                1200: "1200px",
            },
            height: {
                600: "600px",
                1200: "1200px",
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
        require("@tailwindcss/line-clamp"),
        require("@tailwindcss/aspect-ratio"),
        require("daisyui"),
    ],
    daisyui: {
        themes: [
            "synthwave", // first one will be the default theme
        ],
    },
};
