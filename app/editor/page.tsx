'use client';

import { useEffect, useState } from 'react';
import JsonEditor from '@/components/Editor';
import { Button } from '@/components/ui/button';

interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export default function EditorPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files/list?path=.');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files.filter((file: FileInfo) => file.type === 'file' && file.name.endsWith('.json')));
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const loadFileContent = async (filePath: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/get?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading file content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch('/api/files/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: selectedFile,
          content,
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('File saved successfully');
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const formatJson = () => {
    try {
      const formattedJson = JSON.stringify(JSON.parse(content), null, 2);
      setContent("{}");
      setTimeout(() => {
        setContent(formattedJson);
      }, 200);
    } catch (error: any) {
      console.error('Error formatting JSON:', error);
      // Add a console log to see the error message
      console.log('Error message:', error.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* File Explorer */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Files</h2>
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.path}
              className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${selectedFile === file.path ? 'bg-gray-200' : ''
                }`}
              onClick={() => setSelectedFile(file.path)}
            >
              {file.name}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-end gap-3">
                <h2 className="text-lg font-semibold">{selectedFile}</h2>
                <Button onClick={saveFile}>Save</Button>
                <Button onClick={formatJson}>Pretty JSON</Button>
              </div>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              <JsonEditor
                defaultValue={content}
                onChange={setContent}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
}
