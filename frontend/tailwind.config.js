/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New unified color palette
        'deep-space': '#002642',
        'dark-amaranth': '#840032',
        'golden-orange': '#E59500',
        'dust-grey': '#E5DADA',
        'ink-black': '#02040F',
        // Semantic colors using the palette
        'primary': '#E59500',        // Golden Orange - Primary CTA (like DoorDash)
        'primary-dark': '#002642',   // Deep Space Blue - Headers, dark elements
        'accent': '#840032',         // Dark Amaranth - Accents, warnings
        'background': '#E5DADA',     // Dust Grey - Light backgrounds
        'text-dark': '#02040F',      // Ink Black - Primary text
        'text-light': '#666666',     // Secondary text
        'success': '#10b981',        // Keep green for success
        'danger': '#840032',         // Use Dark Amaranth for errors
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

