// parseText.jsx
// Utility to parse @thought, @idea, and @task mentions in text and link them to their respective pages
import { Link } from 'react-router-dom';
import React from 'react';

// Unified slugify function
function slugify(str) {
  return str
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\w\u00C0-\u024F]+/g, '-') // Unicode letters, numbers, underscores
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

// Main parser function
export function parseText(text, data = null) {
  // Optionally accept data for performance/testing
  const thoughts = data?.thoughts || JSON.parse(localStorage.getItem('thoughts') || '[]');
  const ideas = data?.ideas || JSON.parse(localStorage.getItem('ideas') || '[]');
  const tasks = data?.tasks || JSON.parse(localStorage.getItem('tasks') || '[]');

  // Helper: parse markdown (bold, italic, code, links)
  function parseMarkdown(str) {
    // Inline code
    str = str.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
    // Bold
    str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Markdown links [text](url)
    str = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return str;
  }

  // Regex for [custom text](@type:slug) or @type:slug
  const mentionRegex = /(?:\[([^\]]+)\])?@(?<type>thought|idea|task):(?<slug>[\w\u00C0-\u024F-]+)/g;
  // Regex for URLs
  const urlRegex = /\b(https?:\/\/[^\s<]+[^\s<.,;:!?)]*)/gi;
  // Regex for email addresses
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  // Regex for hashtags
  const hashtagRegex = /#([\w\u00C0-\u024F-]+)/g;

  // Split by newlines for <br />
  const lines = text.split(/\n/);
  let result = [];
  lines.forEach((line, lineIdx) => {
    let parts = [];
    let lastIndex = 0;
    // Mentions first (so they don't conflict with markdown or URLs)
    while (true) {
      const match = mentionRegex.exec(line);
      if (!match) break;
      const { type, slug } = match.groups;
      const customText = match[1];
      parts.push(line.slice(lastIndex, match.index));
      let found = null;
      let to = '#';
      let display = customText || match[0];
      if (type === 'thought') {
        found = thoughts.find((t) => slugify(t.thought) === slug);
        if (found) {
          to = `/thoughts#${found.id}`;
          display = customText || `@thought:${slug}`;
        }
      } else if (type === 'idea') {
        found = ideas.find((i) => slugify(i.title) === slug);
        if (found) {
          to = `/ideas#${found.id}`;
          display = customText || `@idea:${slug}`;
        }
      } else if (type === 'task') {
        found = tasks.find((t) => slugify(t.name) === slug);
        if (found) {
          to = `/tasks#${found.id}`;
          display = customText || `@task:${slug}`;
        }
      }
      if (found) {
        parts.push(
          <Link
            key={match.index}
            to={to}
            className="text-blue-400 hover:underline"
          >
            {display}
          </Link>
        );
      } else {
        parts.push(
          <span
            key={match.index}
            className="text-red-400 underline decoration-dotted cursor-help"
            title={`No ${type} found for slug: ${slug}`}
          >
            {display}
          </span>
        );
      }
      lastIndex = mentionRegex.lastIndex;
    }
    parts.push(line.slice(lastIndex));
    // Now process each part for URLs, emails, hashtags, and markdown
    let processed = [];
    parts.forEach((part, i) => {
      if (typeof part !== 'string') {
        processed.push(part);
        return;
      }
      let str = part;
      let idx = 0;
      // URLs
      str = str.replace(urlRegex, (url) => {
        processed.push(
          <a key={`url-${lineIdx}-${i}-${idx++}`} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">{url}</a>
        );
        return '\u0000';
      });
      // Emails
      str = str.replace(emailRegex, (email) => {
        processed.push(
          <a key={`email-${lineIdx}-${i}-${idx++}`} href={`mailto:${email}`} className="text-blue-500 underline">{email}</a>
        );
        return '\u0000';
      });
      // Hashtags
      str = str.replace(hashtagRegex, (tag) => {
        processed.push(
          <span key={`tag-${lineIdx}-${i}-${idx++}`} className="text-purple-500 cursor-pointer hover:underline" title={`Search for #${tag.slice(1)}`}>{tag}</span>
        );
        return '\u0000';
      });
      // Markdown (bold, italic, code, links)
      str = parseMarkdown(str);
      // Remove null chars and push remaining text/HTML
      str.split('\u0000').forEach((frag, j) => {
        if (frag) {
          processed.push(<span key={`frag-${lineIdx}-${i}-${j}`} dangerouslySetInnerHTML={{ __html: frag }} />);
        }
      });
    });
    result = result.concat(processed);
    if (lineIdx < lines.length - 1) result.push(<br key={`br-${lineIdx}`} />);
  });
  return result;
}