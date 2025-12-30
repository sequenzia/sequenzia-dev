'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CodeContentData } from '@/types';

interface CodeContentProps {
  content: CodeContentData;
  displayMode: 'preview' | 'partial' | 'full';
  messageId: string;
}

// Language to display name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
};

export const CodeContent = memo(function CodeContent({
  content,
  displayMode,
  messageId,
}: CodeContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(content.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [content.code]
  );

  const lines = content.code.split('\n');
  const languageDisplay =
    LANGUAGE_NAMES[content.language.toLowerCase()] || content.language;

  // Preview mode - just show icon and language
  if (displayMode === 'preview') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Code className="w-4 h-4" />
        <span className="text-sm">{content.filename || 'Code snippet'}</span>
        <Badge variant="secondary" className="text-xs">
          {languageDisplay}
        </Badge>
      </div>
    );
  }

  // Determine visible lines
  const maxLines = displayMode === 'partial' ? 10 : lines.length;
  const visibleLines = lines.slice(0, maxLines);
  const hasMoreLines = lines.length > maxLines;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="space-y-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-muted-foreground" />
          {content.filename && (
            <span className="text-sm font-medium">{content.filename}</span>
          )}
          <Badge variant="secondary" className="text-xs">
            {languageDisplay}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code block */}
      <div
        className={cn(
          'rounded-lg bg-[var(--code-background)] border border-border overflow-hidden',
          'font-mono text-sm'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {visibleLines.map((line, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  {content.showLineNumbers !== false && (
                    <td
                      className={cn(
                        'px-3 py-0.5 text-right select-none',
                        'text-[var(--code-line-number)] border-r border-border/50',
                        'w-10 min-w-10'
                      )}
                    >
                      {index + 1}
                    </td>
                  )}
                  <td className="px-4 py-0.5">
                    <pre className="whitespace-pre">
                      <code>{line || ' '}</code>
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* More lines indicator */}
        {hasMoreLines && (
          <div className="px-4 py-2 text-center text-sm text-muted-foreground bg-muted/30 border-t border-border/50">
            +{lines.length - maxLines} more lines...
          </div>
        )}
      </div>

      {/* Stats (in full mode) */}
      {displayMode === 'full' && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{lines.length} lines</span>
          <span>{content.code.length} characters</span>
        </div>
      )}
    </motion.div>
  );
});
