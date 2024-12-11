import { ImageResponse } from 'next/og';
export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url.toLowerCase());

  // ?username=<username>
  const hasUsername = searchParams.has('username');
  const username = hasUsername
    ? searchParams.get('username')?.slice(0, 100)
    : 'Default Username';

  // ?description=<description>
  const hasDescription = searchParams.has('description');
  const description = hasDescription
    ? searchParams.get('description')?.slice(0, 100)
    : 'Default Description';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px',
          backgroundImage: 'url(https://whoami.page/og.png)',
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#000000' }}>
          {username}
        </div>
        <div style={{ fontSize: '24px', color: '#888888', marginTop: '10px' }}>
          {description}
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
    },
  );
}
