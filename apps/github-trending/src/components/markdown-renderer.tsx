import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  markdown: string;
};

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div className="flex flex-col gap-6 text-base leading-8 text-card-foreground">
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
            <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">
              {children}
            </code>
          ),
          h1: ({ children }) => (
            <h1 className="break-words text-4xl font-semibold tracking-normal text-card-foreground sm:text-[2.75rem]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-4 text-2xl font-semibold tracking-normal text-card-foreground">
              {children}
            </h2>
          ),
          li: ({ children }) => <li>{children}</li>,
          p: ({ children }) => (
            <p className="text-card-foreground/85">{children}</p>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-3xl border border-primary/20 bg-primary p-5 text-primary-foreground [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-primary-foreground">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="flex list-disc flex-col gap-2 pl-5 text-card-foreground/85">
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
