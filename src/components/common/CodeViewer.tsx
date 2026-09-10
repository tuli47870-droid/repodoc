import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface CodeViewerProps {
  file: string;
  line?: number;
  code: string;
  language?: string;
  highlightLines?: number[];
}

export function CodeViewer({ file, line, code, highlightLines = [] }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2 text-sm">
          <code className="font-mono text-xs">{file}</code>
          {line && (
            <span className="text-muted-foreground">
              Line {line}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Copy code"
          >
            {copied ? (
              <span className="text-xs text-green-500">Copied!</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Open file"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm">
          {lines.map((lineText, idx) => {
            const lineNumber = line ? line + idx : idx + 1;
            const isHighlighted = highlightLines.includes(lineNumber);
            return (
              <div
                key={idx}
                className={`${isHighlighted ? 'bg-yellow-500/10 -mx-4 px-4' : ''}`}
              >
                <span className="text-muted-foreground select-none inline-block w-8 text-right mr-4">
                  {lineNumber}
                </span>
                <span>{lineText}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
