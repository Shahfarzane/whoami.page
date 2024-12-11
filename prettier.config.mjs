/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  arrowParens: 'always',
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
