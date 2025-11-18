import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'system-ui',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
export default config;

