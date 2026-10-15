import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';
import { useAppSelector } from '../../hooks/useStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface NotesProps {
  fileId?: string;
  fileName?: string;
}

// Detect language from info string or file extension hints
function detectLanguage(className?: string): string {
  const match = /language-(\w+)/.exec(className ?? '');
  return match ? match[1] : 'text';
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const isBlock = !props.style && (className?.startsWith('language-') ?? false);
    const lang = detectLanguage(className);

    if (isBlock) {
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={lang}
          PreTag="div"
          showLineNumbers
          customStyle={{
            margin: '1rem 0',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#0d0d0d',
          }}
          codeTagProps={{ style: { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    // Inline code
    return (
      <code
        className="text-indigo-300 bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export const Notes = ({ fileId, fileName }: NotesProps) => {
  const file = useAppSelector((state) =>
    state.vfs.files.find((f) => f.id === fileId)
  );

  const content = file?.content ?? null;

  if (!fileId || content === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] text-gray-400 gap-3 px-8 text-center">
        <FileText size={28} className="text-gray-600" />
        <p className="text-sm">{!fileId ? 'No file specified.' : `No content found for "${fileName}".`}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* File Tab Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border-b border-black/50 text-xs text-gray-400 select-none">
        <FileText size={13} className="text-indigo-400" />
        <span className="text-gray-300">{fileName ?? 'document'}</span>
      </div>

      {/* Markdown Content with syntax-highlighted code blocks */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:text-gray-100 prose-headings:font-semibold
            prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3 prose-h1:mb-6
            prose-h2:text-xl prose-h2:text-indigo-300 prose-h2:mt-8
            prose-h3:text-base prose-h3:text-purple-300
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-100 prose-strong:font-semibold
            prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-400
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:marker:text-indigo-400
            prose-hr:border-white/10"
        >
          <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
