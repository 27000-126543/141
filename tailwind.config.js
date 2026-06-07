/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        cyber: {
          bg: "#0a0a0f",
          "bg-light": "#12121a",
          "bg-card": "#1a1a24",
          primary: "#00f5ff",
          secondary: "#ff00ff",
          accent: "#ff3366",
          success: "#00ff88",
          warning: "#ffaa00",
          danger: "#ff3366",
          muted: "#6b7280",
          grid: "#1e1e2e",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "neon-cyan": "0 0 5px #00f5ff, 0 0 20px rgba(0, 245, 255, 0.5)",
        "neon-magenta": "0 0 5px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.5)",
        "neon-green": "0 0 5px #00ff88, 0 0 20px rgba(0, 255, 136, 0.5)",
        "neon-red": "0 0 5px #ff3366, 0 0 20px rgba(255, 51, 102, 0.5)",
        "neon-yellow": "0 0 5px #ffcc00, 0 0 20px rgba(255, 204, 0, 0.5)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 2s linear infinite",
        "glitch": "glitch 0.3s ease-in-out infinite",
        "data-flow": "data-flow 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.3)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
        },
        "data-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      clipPath: {
        "cyber-btn": "polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)",
        "cyber-card": "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
      },
    },
  },
  plugins: [],
};
