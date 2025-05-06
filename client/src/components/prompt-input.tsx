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
import { CodePrompt } from "@/lib/openai";
import { Play, Share2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (promptData: CodePrompt) => void;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [includeComments, setIncludeComments] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    onSubmit({
      prompt,
      language: language === "Any Language" ? undefined : language,
      includeComments,
    });
  };

  return (
    <Card className="bg-card mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Prompt</h2>
          <div>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the code you want to generate..."
            className="min-h-32 px-3 py-2 bg-background text-foreground code-font resize-y mb-3"
          />
          
          <div className="flex flex-wrap justify-between mt-3 items-center">
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Any Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Language">Any Language</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="TypeScript">TypeScript</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="HTML/CSS">HTML/CSS</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="C#">C#</SelectItem>
                  <SelectItem value="PHP">PHP</SelectItem>
                  <SelectItem value="Go">Go</SelectItem>
                  <SelectItem value="Ruby">Ruby</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="comments" 
                  checked={includeComments}
                  onCheckedChange={(checked) => setIncludeComments(checked === true)}
                />
                <Label htmlFor="comments" className="text-sm">Include comments</Label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="mt-2 sm:mt-0"
              disabled={!prompt.trim() || isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
