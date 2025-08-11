// Converts @thought, @idea, and @task mentions into links.
import { Link } from 'react-router-dom';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Creates a URL-friendly slug from a string.
function slugify(str) {
  return str
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\w\\u00C0-\\u024F]+/g, '-') // Keep Unicode letters, numbers, and hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single one
}

// Parses text to find and link @mentions.
export function parseText(text, data = null) {
  // Allow passing in data for better performance or testing.
  const thoughts = data?.thoughts || JSON.parse(localStorage.getItem('thoughts') || '[]');
  const ideas = data?.ideas || JSON.parse(localStorage.getItem('ideas') || '[]');
  const tasks = data?.tasks || JSON.parse(localStorage.getItem('tasks') || '[]');

  // Regex for [@type:slug] or @type:slug
  const mentionRegex = /(?:\\\[([^\]]+)\\\])?@(?<type>thought|idea|task):(?<slug>[\wÀ-ɏ-]+)/g;

  const components = {
    a: ({ node, ...props }) => {
      const href = props.href;
      const mentionMatch = mentionRegex.exec(href);

      if (mentionMatch) {
        const { type, slug } = mentionMatch.groups;
        let found = null;
        let to = '#';
        let display = props.children[0] || href;

        if (type === 'thought') {
          found = thoughts.find((t) => slugify(t.thought) === slug);
          if (found) {
            to = `/thoughts#${found.id}`;
            display = props.children[0] || `@thought:${slug}`;
          }
        } else if (type === 'idea') {
          found = ideas.find((i) => slugify(i.title) === slug);
          if (found) {
            to = `/ideas#${found.id}`;
            display = props.children[0] || `@idea:${slug}`;
          }
        } else if (type === 'task') {
          found = tasks.find((t) => slugify(t.name) === slug);
          if (found) {
            to = `/tasks#${found.id}`;
            display = props.children[0] || `@task:${slug}`;
          }
        }

        if (found) {
          return (
            <Link
              to={to}
              className="text-blue-400 hover:underline"
            >
              {display}
            </Link>
          );
        } else {
          return (
            <span
              className="text-red-400 underline decoration-dotted cursor-help"
              title={`No ${type} found for slug: ${slug}`}
            >
              {display}
            </span>
          );
        }
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all" />;
    },
    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-4" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-4" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
    li: ({ ...props }) => <li className="mb-2" {...props} />,
    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4" {...props} />,
    code: ({ inline, ...props }) => {
      if (inline) {
        return <code className="bg-gray-200 dark:bg-gray-700 rounded px-1" {...props} />;
      }
      return <pre className="bg-gray-200 dark:bg-gray-700 rounded p-2 my-4 overflow-x-auto"><code {...props} /></pre>;
    },
  };

  return <ReactMarkdown components={components} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{text}</ReactMarkdown>;
}

