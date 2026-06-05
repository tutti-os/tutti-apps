import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  markdown: string;
};

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div className="flex flex-col gap-5 text-sm leading-7 text-foreground">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href }) => (
            <a
              className="text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={href}
              rel={href?.startsWith("http") ? "noreferrer noopener" : undefined}
              target={href?.startsWith("http") ? "_blank" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
              {children}
            </code>
          ),
          h1: ({ children }) => (
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-3 text-xl font-semibold tracking-normal text-foreground">
              {children}
            </h2>
          ),
          li: ({ children }) => <li>{children}</li>,
          p: ({ children }) => <p className="text-foreground/85">{children}</p>,
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md border border-border bg-card p-4">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="flex list-disc flex-col gap-2 pl-5 text-foreground/85">
              {children}
            </ul>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
