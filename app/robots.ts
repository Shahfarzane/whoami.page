export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: 'https://whoami.page/sitemap.xml',
    host: 'https://whoami.page',
  };
}
