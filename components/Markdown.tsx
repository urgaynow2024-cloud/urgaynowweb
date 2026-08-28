import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold text-ink-800 dark:text-ink-100">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="my-4 leading-relaxed text-ink-700 dark:text-ink-200">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-ink-700 dark:text-ink-200">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-ink-700 dark:text-ink-200">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700 dark:text-brand-300"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-brand-300 bg-brand-50 px-4 py-2 italic text-brand-800 dark:bg-brand-900/40 dark:text-brand-100">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-ink-100 px-1.5 py-0.5 text-sm text-pink-700 dark:bg-ink-800 dark:text-pink-300">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-lg bg-ink-900 p-4 text-sm text-ink-100">{children}</pre>
  ),
  hr: () => <hr className="my-8 border-ink-200 dark:border-ink-700" />,
  strong: ({ children }) => <strong className="font-semibold text-ink-900 dark:text-white">{children}</strong>,
};

export function Markdown({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
