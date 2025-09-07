import React, { useState, useRef, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables?: string[];
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  variables = [],
  placeholder = "Start typing..."
}) => {
  const [showSource, setShowSource] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Format text with HTML tags
  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert variable at cursor position
  const insertVariable = useCallback((variable: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const variableNode = document.createTextNode(`{${variable}}`);
      range.deleteContents();
      range.insertNode(variableNode);
      
      // Move cursor after inserted text
      range.setStartAfter(variableNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    } else {
      // Fallback: append to end
      const currentContent = editorRef.current?.innerHTML || '';
      const newContent = currentContent + `{${variable}}`;
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent;
        onChange(newContent);
      }
    }
  }, [onChange]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle source mode toggle
  const toggleSource = () => {
    if (showSource) {
      // Switching from source to visual
      if (editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
    setShowSource(!showSource);
  };

  const toolbarButtons = [
    { command: 'bold', icon: 'B', title: 'Bold', style: 'font-bold' },
    { command: 'italic', icon: 'I', title: 'Italic', style: 'italic' },
    { command: 'underline', icon: 'U', title: 'Underline', style: 'underline' },
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
    { command: 'createLink', icon: '🔗', title: 'Insert Link' },
  ];

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Formatting buttons */}
        {toolbarButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => {
              if (button.command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) formatText(button.command, url);
              } else {
                formatText(button.command);
              }
            }}
            className={`px-2 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-100 rounded ${button.style || ''}`}
            title={button.title}
          >
            {button.icon}
          </button>
        ))}
        
        {/* Separator */}
        <div className="border-l border-gray-300 mx-1"></div>
        
        {/* Source toggle */}
        <button
          type="button"
          onClick={toggleSource}
          className={`px-2 py-1 text-sm border border-gray-300 rounded ${
            showSource ? 'bg-blue-100 text-blue-800' : 'bg-white hover:bg-gray-100'
          }`}
          title="Toggle HTML Source"
        >
          HTML
        </button>
      </div>

      {/* Variables panel */}
      {variables.length > 0 && (
        <div className="bg-blue-50 border-b border-gray-300 p-2">
          <div className="text-xs text-gray-600 mb-2">Click to insert variable:</div>
          <div className="flex flex-wrap gap-1">
            {variables.map((variable) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border font-mono"
              >
                {`{${variable}}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        {showSource ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm resize-none focus:outline-none"
            placeholder="HTML source code..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: value }}
            className="w-full min-h-64 p-3 focus:outline-none prose prose-sm max-w-none"
            style={{ minHeight: '256px' }}
            suppressContentEditableWarning={true}
          />
        )}
        
        {!showSource && (!value || value.trim() === '') && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;