import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          orange: "#E85D2C",
          green: "#155855",
          ivory: "#FBF7EF",
          sand: "#EFE5D6",
          ink: "#1D2524"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(21, 88, 85, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
