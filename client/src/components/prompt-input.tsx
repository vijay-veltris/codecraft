import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CodePrompt, generateReactProject } from "@/lib/openai";
import { Play, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LLMSelector, type LLMProvider } from './llm-selector';

interface PromptInputProps {
  onSubmit: (data: {
    prompt: string;
    language: string;
    llmProvider: LLMProvider;
    llmConfig?: {
      apiKey?: string;
      baseUrl?: string;
      model?: string;
    };
  }) => void;
  isLoading?: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [includeComments, setIncludeComments] = useState(true);
  const [llmProvider, setLlmProvider] = useState<LLMProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (language === "React") {
      try {
        const result = await generateReactProject(
          prompt || "react-app",
          "A React application generated with CodeCrafter",
          "CodeCrafter User"
        );
        
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to generate React project",
            variant: "destructive",
          });
        }
        return;
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate React project",
          variant: "destructive",
        });
        return;
      }
    }

    onSubmit({
      prompt: prompt.trim(),
      language,
      llmProvider,
      llmConfig: llmProvider === "openai" ? { apiKey } : undefined
    });
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">What would you like to create?</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to build..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Programming Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <LLMSelector
              value={llmProvider}
              onChange={setLlmProvider}
              className="space-y-2"
            />
          </div>

          {llmProvider === "openai" && (
            <div className="space-y-2">
              <Label htmlFor="api-key">OpenAI API Key (optional)</Label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          <div className="flex flex-wrap justify-between mt-3 items-center">
            <div className="flex items-center space-x-4">
              <Checkbox 
                id="comments" 
                checked={includeComments}
                onCheckedChange={(checked) => setIncludeComments(checked === true)}
              />
              <Label htmlFor="comments" className="text-sm">Include comments</Label>
            </div>

            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  {language === "React" ? "Generate Project" : "Generate Code"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
