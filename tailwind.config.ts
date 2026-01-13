import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "rgb(var(--background))",
                foreground: "rgb(var(--foreground))",
                card: {
                    DEFAULT: "rgb(var(--card))",
                    foreground: "rgb(var(--card-foreground))",
                },
                calma: {
                    blue: {
                        50: "rgb(var(--calma-blue-50))",
                        500: "rgb(var(--calma-blue-500))",
                        700: "rgb(var(--calma-blue-700))",
                    }
                },
                primary: {
                    DEFAULT: "rgb(var(--calma-blue-500))",
                    foreground: "white",
                },
            },
            borderRadius: {
                lg: "0.75rem",
                xl: "0.75rem", // Default overrides
                md: "calc(0.75rem - 2px)",
                sm: "calc(0.75rem - 4px)",
            },
        },
    },
    plugins: [],
};

export default config;
