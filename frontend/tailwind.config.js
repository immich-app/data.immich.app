import { tailwindConfig } from '@immich/ui/theme/default.js';

const { colors, borderColor } = tailwindConfig();

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{apps,src}/**/*.{html,js,svelte,ts}',
    './node_modules/@immich/ui/dist/**/*.{svelte,js}',
    '../ui/dist/**/*.{svelte,js,ts,html}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...colors,
        // Light Theme
        'immich-primary': 'rgb(var(--immich-primary) / <alpha-value>)',

        // Dark Theme
        'immich-dark-primary': 'rgb(var(--immich-dark-primary) / <alpha-value>)',
      },
      borderColor,
      fontFamily: {
        'immich-title': ['Snowburst One', 'cursive'],
        'immich-mono': ['Overpass Mono', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
      },
      screens: {
        tall: { raw: '(min-height: 800px)' },
      },
    },
  },
};
