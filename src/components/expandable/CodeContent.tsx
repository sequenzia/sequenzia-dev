'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block';
import type { CodeContentData } from '@/types';
import type { BundledLanguage } from 'shiki';

interface CodeContentProps {
  content: CodeContentData;
  messageId?: string;
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
}: CodeContentProps) {
  const lines = content.code.split('\n');
  const languageDisplay =
    LANGUAGE_NAMES[content.language.toLowerCase()] || content.language;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="space-y-2"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileCode className="w-4 h-4 text-muted-foreground" />
        {content.filename && (
          <span className="text-sm font-medium">{content.filename}</span>
        )}
        <Badge variant="secondary" className="text-xs">
          {languageDisplay}
        </Badge>
      </div>

      {/* Code block with syntax highlighting */}
      <CodeBlock
        code={content.code}
        language={content.language as BundledLanguage}
        showLineNumbers={content.showLineNumbers !== false}
      >
        <CodeBlockCopyButton />
      </CodeBlock>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{lines.length} lines</span>
        <span>{content.code.length} characters</span>
      </div>
    </motion.div>
  );
});
