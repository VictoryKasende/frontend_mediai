import React from 'react';

/**
 * Composant pour afficher du contenu Markdown avec un style médical
 * Version simplifiée sans react-markdown pour éviter les conflits avec React 19
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  // Pour l'instant, affichage simple du contenu brut
  if (!content) return null;
  
  // Conversion basique de quelques éléments markdown
  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n/g, '<br />')
      .replace(/^- (.*)/gm, '<div class="flex items-start mb-1"><span class="text-blue-600 mr-2">•</span><span>$1</span></div>')
      .replace(/^\d+\. (.*)/gm, '<div class="mb-1">$&</div>');
  };

  return (
    <div 
      className={`text-sm leading-relaxed text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

export default MarkdownRenderer;
