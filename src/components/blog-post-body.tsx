import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  body: string;
};

export default function BlogPostBody({ body }: Props) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node: _node, ...props }) => (
          <a
            {...props}
            target={props.href?.startsWith("http") ? "_blank" : undefined}
            rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
          />
        ),
      }}
    >
      {body}
    </Markdown>
  );
}
