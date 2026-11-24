import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAllowedImageUrl } from "@/lib/content/images";

// Renders a post's Markdown body. It is built to be safe for text written by
// staff but published to the whole internet:
//  * react-markdown builds React elements itself, so raw <script>/<img onerror>
//    HTML in the text is never executed (it is dropped).
//  * Links: only http(s), mailto and tel; external ones open with
//    rel="noopener noreferrer nofollow".
//  * Images: ONLY pictures from this project's public media bucket; anything
//    else is not rendered.
export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      urlTransform={(url, key) => {
        if (key === "src") return isAllowedImageUrl(url) ? url : "";
        const safe = defaultUrlTransform(url);
        return /^(https?:|mailto:|tel:|\/|#)/i.test(safe) ? safe : "";
      }}
      components={{
        a: ({ href, children }) => {
          const external = !!href && /^https?:/i.test(href);
          return (
            <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
              {children}
            </a>
          );
        },
        img: ({ src, alt }) =>
          src && typeof src === "string" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ""} loading="lazy" className="rounded-lg my-6 max-w-full h-auto" />
          ) : null,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
