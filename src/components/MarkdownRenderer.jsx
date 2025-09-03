import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Composant pour afficher du contenu Markdown avec un style médical
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          // Titres
          h1: ({ children }) => (
            <h1 className="text-xl font-heading font-bold text-content-primary mb-4 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-heading font-semibold text-content-primary mb-3 mt-5 first:mt-0 flex items-center">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-heading font-semibold text-content-primary mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-heading font-semibold text-content-primary mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          
          // Paragraphes
          p: ({ children }) => (
            <p className="text-sm font-body leading-relaxed text-content-primary mb-3 last:mb-0">
              {children}
            </p>
          ),
          
          // Listes
          ul: ({ children }) => (
            <ul className="list-none space-y-1 mb-3 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm font-body leading-relaxed text-content-primary flex items-start">
              <span className="text-mediai-primary mr-2 text-xs mt-1">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          
          // Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-content-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-content-secondary">
              {children}
            </em>
          ),
          
          // Code
          code: ({ inline, children }) => (
            inline ? (
              <code className="bg-surface-muted text-mediai-primary px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ) : (
              <pre className="bg-surface-muted p-3 rounded-lg overflow-x-auto mb-3">
                <code className="text-xs font-mono text-content-primary">
                  {children}
                </code>
              </pre>
            )
          ),
          
          // Séparateurs
          hr: () => (
            <hr className="border-t border-border-primary my-4" />
          ),
          
          // Liens
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-mediai-primary hover:text-mediai-primary/80 underline"
            >
              {children}
            </a>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-mediai-primary bg-mediai-primary/5 pl-4 py-2 mb-3 italic">
              <div className="text-sm font-body text-content-secondary">
                {children}
              </div>
            </blockquote>
          ),
          
          // Tableaux
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-border-primary rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-muted">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border-primary last:border-b-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-content-primary">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm font-body text-content-primary">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
