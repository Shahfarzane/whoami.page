import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { currentUser } from '@clerk/nextjs/server';

const f = createUploadthing();

export const ourFileRouter = {
  projectImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      const user = await currentUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Project image upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
    }),

  experienceImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      const user = await currentUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log(
        'Experience image upload complete for userId:',
        metadata.userId,
      );
      console.log('file url', file.url);
    }),

  postImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      const user = await currentUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('post image upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
