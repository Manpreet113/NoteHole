// parseText.jsx
// Utility to parse @thought, @idea, and @task mentions in text and link them to their respective pages
import { Link } from 'react-router-dom';

export function parseText(text) {
  // Load all thoughts, ideas, and tasks from localStorage
  const thoughts = JSON.parse(localStorage.getItem('thoughts') || '[]');
  const ideas = JSON.parse(localStorage.getItem('ideas') || '[]');
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  // Regex to match @thought:slug, @idea:slug, @task:slug
  const regex = /@(thought|idea|task):([a-z0-9-]+)/g;
  let match;
  const parts = [];
  let lastIndex = 0;

  // Iterate through all matches in the text
  while ((match = regex.exec(text)) !== null) {
    const type = match[1];
    const slug = match[2];
    parts.push(text.slice(lastIndex, match.index));

    // Find the referenced item and create a link if it exists
    if (type === 'thought') {
      const thought = thoughts.find((t) => t.text.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
      if (thought) {
        parts.push(
          <Link
            key={match.index}
            to={`/thoughts#${thought.id}`}
            className="text-blue-400 hover:underline"
          >
            {match[0]}
          </Link>
        );
      } else {
        parts.push(match[0]);
      }
    } else if (type === 'idea') {
      const idea = ideas.find((i) => i.title.toLowerCase().replace(/\s+/g, '-') === slug);
      if (idea) {
        parts.push(
          <Link
            key={match.index}
            to={`/ideas#${idea.id}`}
            className="text-blue-400 hover:underline"
          >
            {match[0]}
          </Link>
        );
      } else {
        parts.push(match[0]);
      }
    } else if (type === 'task') {
      const task = tasks.find((t) => t.name.toLowerCase().replace(/\s+/g, '-') === slug);
      if (task) {
        parts.push(
          <Link
            key={match.index}
            to={`/tasks#${task.id}`}
            className="text-blue-400 hover:underline"
          >
            {match[0]}
          </Link>
        );
      } else {
        parts.push(match[0]);
      }
    }
    lastIndex = regex.lastIndex;
  }
  // Add any remaining text after the last match
  parts.push(text.slice(lastIndex));
  return parts;
}