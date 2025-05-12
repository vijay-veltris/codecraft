import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import type { CodeSnippet } from '../lib/openai';
import { Download, Copy, Share2 } from 'lucide-react';

interface CodeDisplayProps {
  snippets: CodeSnippet[];
}

export function CodeDisplay({ snippets }: CodeDisplayProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  const { toast } = useToast();

  if (snippets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Generated code will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied!',
        description: 'Code copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (snippet: CodeSnippet) => {
    const blob = new Blob([snippet.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = snippet.filename || `code.${snippet.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {snippets.map((snippet) => (
              <TabsTrigger
                key={snippet.id}
                value={snippet.id}
                className="flex items-center gap-2"
              >
                {snippet.filename || `Code (${snippet.language})`}
              </TabsTrigger>
            ))}
          </TabsList>

          {snippets.map((snippet) => (
            <TabsContent key={snippet.id} value={snippet.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Generated using {snippet.llmProvider}
                    {snippet.usage && (
                      <span className="ml-2">
                        ({snippet.usage.total_tokens} tokens)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(snippet.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(snippet)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code>{snippet.content}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 