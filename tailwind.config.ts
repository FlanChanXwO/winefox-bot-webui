import { nextui } from "@nextui-org/react";
import { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                sakura: {
                    50: "#fff0f5",
                    100: "#ffe4e1",
                    200: "#ffb7b2",
                    300: "#ff9e99",
                    900: "#880e4f",
                },
            },
        },
    },
    darkMode: "class",
    plugins: [nextui({
        themes: {
            light: {
                colors: {
                    primary: {
                        DEFAULT: "#ffb7b2",
                        foreground: "#ffffff",
                    },
                    focus: "#ff9e99",
                },
            },
        },
    })],
};
export default config;
