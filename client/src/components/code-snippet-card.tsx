import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CodeSnippet } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/themes/prism-tomorrow.css";

interface CodeSnippetCardProps {
  snippet: CodeSnippet;
}

export function CodeSnippetCard({ snippet }: CodeSnippetCardProps) {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"preview" | "console">("preview");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Map file extensions to Prism language
  const getLanguageFromFilename = (filename?: string): string => {
    if (!filename) {
      return snippet.language.toLowerCase() || 'plaintext';
    }
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'sh': 'bash',
      'bash': 'bash',
      'txt': 'plaintext',
    };
    
    return languageMap[extension || ''] || snippet.language.toLowerCase() || 'plaintext';
  };
  
  const language = getLanguageFromFilename(snippet.filename);
  
  // Check if the snippet is previewable
  const isPreviewable = (): boolean => {
    return ['html', 'javascript', 'js', 'css'].includes(language);
  };
  
  // Highlight code with Prism
  const highlightCode = () => {
    const highlighted = Prism.highlight(
      snippet.content,
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
    return highlighted;
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.content);
    toast({
      title: "Copied to clipboard",
      description: `${snippet.filename || 'Code snippet'} has been copied to your clipboard.`,
    });
  };
  
  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([snippet.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = snippet.filename || `code.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Generate HTML for preview iframe
  const generatePreviewHtml = (): string => {
    if (language === 'html') {
      return snippet.content;
    } else if (language === 'javascript' || language === 'js') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>JavaScript Preview</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 1rem; }
            .output { 
              white-space: pre-wrap; 
              font-family: monospace; 
              background: #f5f5f5; 
              padding: 10px; 
              border-radius: 4px; 
              margin-top: 10px;
              border: 1px solid #ddd;
              max-height: 200px;
              overflow: auto;
            }
            .error { color: #e53e3e; }
          </style>
        </head>
        <body>
          <h3>JavaScript Execution</h3>
          <div id="output" class="output"></div>
          <script>
            // Capture console output
            const outputDiv = document.getElementById('output');
            const originalConsole = { 
              log: console.log, 
              error: console.error,
              warn: console.warn,
              info: console.info
            };
            
            console.log = function() {
              const args = Array.from(arguments);
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              
              const div = document.createElement('div');
              div.textContent = message;
              outputDiv.appendChild(div);
              
              // Also send to parent window
              window.parent.postMessage({
                type: 'console',
                method: 'log',
                args: message
              }, '*');
              
              originalConsole.log.apply(console, arguments);
            };
            
            console.error = function() {
              const args = Array.from(arguments);
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              
              const div = document.createElement('div');
              div.textContent = message;
              div.className = 'error';
              outputDiv.appendChild(div);
              
              // Also send to parent window
              window.parent.postMessage({
                type: 'console',
                method: 'error',
                args: message
              }, '*');
              
              originalConsole.error.apply(console, arguments);
            };
            
            try {
              ${snippet.content}
            } catch (error) {
              console.error('Error: ' + error.message);
              
              // Also send to parent window
              window.parent.postMessage({
                type: 'error',
                message: error.message
              }, '*');
            }
          </script>
        </body>
        </html>
      `;
    } else if (language === 'css') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>CSS Preview</title>
          <style>
            ${snippet.content}
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h3>CSS Preview</h3>
            <p>This is a preview of your CSS code. Elements below have common classes applied:</p>
            
            <h4>Heading (h4)</h4>
            <p>Paragraph text</p>
            <button class="button primary">Primary Button</button>
            <button class="button secondary">Secondary Button</button>
            
            <div class="container">
              <div class="box">Box 1</div>
              <div class="box">Box 2</div>
              <div class="box">Box 3</div>
            </div>

            <ul class="list">
              <li class="list-item">List item 1</li>
              <li class="list-item">List item 2</li>
              <li class="list-item">List item 3</li>
            </ul>
            
            <div class="card">
              <div class="card-header">Card Header</div>
              <div class="card-body">
                Card content goes here. This is a sample card to preview your CSS styles.
              </div>
              <div class="card-footer">Card Footer</div>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    return `<div>Preview not available for this file type</div>`;
  };
  
  // Handle preview
  const handlePreview = () => {
    setConsoleOutput([]);
    setPreviewError(null);
    setIsPreviewOpen(true);
  };
  
  // Effect to handle messages from iframe
  useEffect(() => {
    if (!isPreviewOpen) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleOutput(prev => [...prev, event.data.args]);
      } else if (event.data.type === 'error') {
        setPreviewError(event.data.message);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isPreviewOpen]);
  
  // Update iframe content when preview is opened
  useEffect(() => {
    if (isPreviewOpen && iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || 
          (iframeRef.current.contentWindow?.document);
        
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(generatePreviewHtml());
          iframeDoc.close();
        }
      } catch (error) {
        console.error('Error rendering preview:', error);
        setPreviewError('Failed to render preview: ' + (error as Error).message);
      }
    }
  }, [isPreviewOpen, language]);
  
  // Get language badge color
  const getLanguageBadgeColor = (lang: string): string => {
    const colorMap: Record<string, string> = {
      'javascript': 'bg-yellow-900 text-yellow-300',
      'jsx': 'bg-blue-900 text-blue-300',
      'typescript': 'bg-blue-900 text-blue-300',
      'tsx': 'bg-blue-900 text-blue-300',
      'python': 'bg-blue-900 text-blue-300',
      'java': 'bg-orange-900 text-orange-300',
      'csharp': 'bg-purple-900 text-purple-300',
      'go': 'bg-cyan-900 text-cyan-300',
      'ruby': 'bg-red-900 text-red-300',
      'php': 'bg-indigo-900 text-indigo-300',
      'html': 'bg-orange-900 text-orange-300',
      'css': 'bg-blue-900 text-blue-300',
      'default': 'bg-gray-700 text-gray-300',
    };
    
    return colorMap[lang] || colorMap.default;
  };
  
  return (
    <>
      <div className="code-snippet bg-card rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 bg-muted border-b border-border">
          <div className="flex items-center">
            <span className="text-sm font-medium text-foreground">{snippet.filename || `Code (${language})`}</span>
            <span 
              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getLanguageBadgeColor(language)}`}
            >
              {snippet.language || language}
            </span>
          </div>
          <div className="flex space-x-1">
            {isPreviewable() && (
              <button 
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
                title="Preview & Run"
                onClick={handlePreview}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button 
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
              title="Copy code"
              onClick={copyToClipboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
              </svg>
            </button>
            <button 
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
              title="Expand"
              onClick={() => setIsFullscreen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
              title="Download"
              onClick={downloadFile}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          <pre className="language-plaintext rounded-none m-0 p-0 max-h-96 overflow-y-auto">
            <code 
              className={`language-${language} text-sm code-font p-4`}
              dangerouslySetInnerHTML={{ __html: highlightCode() }}
            />
          </pre>
        </div>
      </div>

      {/* Fullscreen Code View */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle className="flex items-center text-base">
              <span className="text-foreground">{snippet.filename || `Code (${language})`}</span>
              <span 
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getLanguageBadgeColor(language)}`}
              >
                {snippet.language || language}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <pre className="language-plaintext rounded-none m-0 p-0 h-full">
              <code 
                className={`language-${language} text-sm code-font p-4`}
                dangerouslySetInnerHTML={{ __html: highlightCode() }}
              />
            </pre>
          </div>
          <div className="border-t p-2 flex justify-end space-x-2">
            {isPreviewable() && (
              <button 
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
                title="Preview & Run"
                onClick={handlePreview}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button 
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
              title="Copy code"
              onClick={copyToClipboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
              </svg>
            </button>
            <button 
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md" 
              title="Download"
              onClick={downloadFile}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle className="flex items-center text-base">
              <span className="text-foreground">Preview: {snippet.filename || `Code (${language})`}</span>
              <span 
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getLanguageBadgeColor(language)}`}
              >
                {snippet.language || language}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              This preview runs in an isolated sandbox environment. Some features may be limited for security reasons.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="preview" className="flex-1 flex flex-col" value={previewTab} onValueChange={(value) => setPreviewTab(value as any)}>
            <div className="border-b px-4">
              <TabsList className="pt-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="console">Console</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preview" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              {previewError && (
                <Alert className="m-2 border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    {previewError}
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 rounded-md p-1">
                <iframe 
                  ref={iframeRef}
                  className="w-full h-full border-0 rounded bg-white" 
                  sandbox="allow-scripts allow-same-origin"
                  title={`Preview of ${snippet.filename || `Code (${language})`}`}
                ></iframe>
              </div>
            </TabsContent>
            
            <TabsContent value="console" className="flex-1 p-0 m-0 overflow-hidden">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 h-full overflow-y-auto font-mono text-sm">
                {consoleOutput.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400">No console output yet.</div>
                ) : (
                  consoleOutput.map((output, index) => (
                    <div key={index} className="mb-1 break-all whitespace-pre-wrap">{output}</div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="border-t p-2 flex justify-between">
            <div>
              {(language === 'javascript' || language === 'js') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setConsoleOutput([]);
                    setPreviewError(null);
                    
                    setTimeout(() => {
                      if (iframeRef.current) {
                        const iframeDoc = iframeRef.current.contentDocument || 
                          (iframeRef.current.contentWindow?.document);
                        
                        if (iframeDoc) {
                          iframeDoc.open();
                          iframeDoc.write(generatePreviewHtml());
                          iframeDoc.close();
                        }
                      }
                    }, 100);
                  }}
                >
                  Run Again
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
