import React from 'react';

/**
 * Composant pour afficher du contenu Markdown avec un style médical
 * Version améliorée pour gérer les diagnostics structurés
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;
  
  // Conversion complète des éléments markdown
  const formatContent = (text) => {
    let formatted = text;
    
    // Titres (### -> h3, ## -> h2, # -> h1)
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-gray-800 mt-4 mb-2 flex items-start">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-3 flex items-start">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');
    
    // Texte en gras et italique
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
    
    // Liens [texte](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>');
    
    // Listes à puces (-)
    formatted = formatted.replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
    
    // Listes numérotées (1. 2. etc.)
    formatted = formatted.replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>');
    
    // Lignes horizontales (---)
    formatted = formatted.replace(/^---$/gim, '<hr class="my-4 border-gray-300" />');
    
    // Sauts de ligne
    formatted = formatted.replace(/\n\n/g, '</p><p class="mb-3">');
    formatted = formatted.replace(/\n/g, '<br />');
    
    // Envelopper dans un paragraphe initial
    formatted = `<p class="mb-3">${formatted}</p>`;
    
    // Envelopper les groupes de <li> dans <ul> ou <ol>
    formatted = formatted.replace(/(<li class="ml-4 mb-1">.*?<\/li>)+/gs, (match) => {
      return `<ul class="list-disc ml-6 mb-3 space-y-1">${match}</ul>`;
    });
    
    formatted = formatted.replace(/(<li class="ml-4 mb-1 list-decimal">.*?<\/li>)+/gs, (match) => {
      return `<ol class="list-decimal ml-6 mb-3 space-y-1">${match}</ol>`;
    });
    
    return formatted;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none text-gray-700 leading-relaxed ${className}`}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
};

export default MarkdownRenderer;
