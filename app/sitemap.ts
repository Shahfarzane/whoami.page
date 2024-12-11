import { MetadataRoute } from 'next';
import { getUsernames, getUserPosts } from '@/app/_services/user';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.page';

 
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const usernames = await getUsernames();
    const userRoutes = usernames.map((username) => ({
      url: `${baseUrl}/${username}`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const posts = await getUserPosts();
    const postRoutes = posts.map((post) => ({
      url: `${baseUrl}/${post.username}/posts/${post.id}`,
      lastModified: new Date(post.updatedAt).toISOString().split('T')[0],
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...baseRoutes, ...userRoutes, ...postRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return baseRoutes; // Return at least the base routes on error
  }
}
