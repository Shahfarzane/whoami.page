import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface LinkifyProps {
  children: string;
}

const Linkify: React.FC<LinkifyProps> = ({ children }) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => {
          const href = props.href || '';
          if (href.startsWith('#')) {
            const tag = href.slice(1);
            return (
              <Link
                href={{
                  pathname: '/hashtag/[tag]',
                  query: { tag, q: tag }, // Include both tag and q in the query
                }}
                as={`/hashtag/${tag}`} // This is what will show in the URL bar
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {props.children}
              </Link>
            );
          }
          return (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
        p: ({ children }) => <p className="mb-2">{children}</p>,
      }}
    >
      {children.replace(/(^|\s)#(\w+)/g, '$1[#$2](#$2)')}
    </ReactMarkdown>
  );
};

export default Linkify;
