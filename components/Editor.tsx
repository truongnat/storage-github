'use client';

import React, { useState, Dispatch, SetStateAction } from 'react';
import Editor from '@monaco-editor/react';

interface EditorProps {
  defaultValue?: string;
  onChange?: Dispatch<SetStateAction<string>>;
}

const JsonEditor: React.FC<EditorProps> = ({
  defaultValue = '{}',
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '{}';
    setValue(newValue);
    
    // Validate JSON
    try {
      JSON.parse(newValue);
      setError(null);
      if (onChange) {
        onChange(newValue);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const editorOptions: any = {
    minimap: { enabled: false },
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full',
    tabSize: 2,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    wordWrap: 'on',
  };

  return (
    <div className="relative w-full h-full">
      <Editor
        height="100%"
        value={value}
        onChange={handleEditorChange}
        language="json"
        options={editorOptions}
        theme="vs-dark"
      />
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white px-4 py-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default JsonEditor;
