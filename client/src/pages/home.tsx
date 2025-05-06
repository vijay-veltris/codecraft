import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/main-layout";
import { PromptInput } from "@/components/prompt-input";
import { CodeSnippetCard } from "@/components/code-snippet-card";
import { LoadingDots } from "@/components/loading-dots";
import { generateCode, type CodePrompt, type CodeSnippet } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { exportProject } from "@/lib/project-export";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [projectName, setProjectName] = useState("codecraft-project");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: (promptData: CodePrompt) => generateCode(promptData),
    onSuccess: (data) => {
      if (data.success && data.snippets) {
        setSnippets(data.snippets);
        if (data.promptId) {
          // Invalidate history query to refresh sidebar
          queryClient.invalidateQueries({ queryKey: ['/api/history'] });
        }
      } else {
        toast({
          title: "Generation Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate code. Please try again.";
      
      // Check for specific OpenAI API key errors to provide better guidance
      if (errorMessage.includes("OPENAI_API_KEY") || 
          errorMessage.includes("authentication") || 
          errorMessage.includes("401") || 
          errorMessage.toLowerCase().includes("api key")) {
        toast({
          title: "API Key Error",
          description: "OpenAI API key is missing or invalid. Please add your API key in the .env.development file.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerateCode = (promptData: CodePrompt) => {
    generateMutation.mutate(promptData);
  };

  const handleDownloadAll = () => {
    // Open the export dialog
    setIsExportDialogOpen(true);
  };

  const handleExportProject = async () => {
    setIsExporting(true);
    try {
      await exportProject(snippets, projectName);
      toast({
        title: "Project Downloaded",
        description: `Project '${projectName}' has been downloaded as a zip file with a README.`,
      });
      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export project.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <PromptInput onSubmit={handleGenerateCode} isLoading={generateMutation.isPending} />
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Response</h2>
            {snippets.length > 0 && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleDownloadAll}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Project
                </Button>
              </div>
            )}
          </div>

          {generateMutation.isPending && (
            <div className="py-12 flex flex-col items-center justify-center">
              <LoadingDots />
              <p className="text-muted-foreground mt-4">Generating code...</p>
            </div>
          )}

          {!generateMutation.isPending && snippets.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center border border-dashed border-border rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <p className="mt-4 text-muted-foreground">Enter a prompt to generate code</p>
            </div>
          )}

          {!generateMutation.isPending && snippets.length > 0 && (
            <div className="space-y-6">
              {snippets.map((snippet) => (
                <CodeSnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Download Project</DialogTitle>
            <DialogDescription>
              Download all {snippets.length} code snippets as a complete project with a README file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Included Files</Label>
                <div className="max-h-32 overflow-y-auto bg-muted rounded p-2">
                  <ul className="text-sm">
                    <li>README.md</li>
                    {snippets.map((snippet) => (
                      <li key={snippet.id}>{snippet.filename}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExportProject}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>Download</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
