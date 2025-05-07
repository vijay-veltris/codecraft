import dotenv from 'dotenv';
// Load environment variables from .env.development or .env
dotenv.config({ path: '.env.development' });
if (!process.env.OPENAI_API_KEY) {
  dotenv.config(); // Try loading from .env if .env.development doesn't exist
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { prompts, history, users, gitConnections } from "@shared/schema";
import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateReactProject } from "./scripts/generate-react-project";

// Create a basic OpenAI client without WebSocket connections
// This configuration avoids ECONNREFUSED errors in local development
// Force the client to use HTTP transport instead of WebSockets
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false // Prevent browser usage
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate code from prompt
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, language, includeComments } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ 
          success: false, 
          message: "Prompt is required" 
        });
      }

      // Format the prompt to include language and comment preferences
      let formattedPrompt = prompt;
      if (language) {
        formattedPrompt = `Generate ${language} code: ${prompt}`;
      }
      if (includeComments === false) {
        formattedPrompt += ". Don't include comments in the code.";
      }

      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are CodeCraft AI, a specialized code generation assistant. Return code in neat, well-structured snippets. When generating multiple files, separate them clearly with filenames. Focus on producing clean, efficient, well-documented, production-ready code. If a specific language is requested, use that language."
            },
            {
              role: "user",
              content: formattedPrompt
            }
          ],
        });

        // Extract code snippets from response
        const responseText = completion.choices[0].message.content || "";
        
        // Parse code snippets from the response
        const codeSnippets = parseCodeSnippets(responseText);
        
        // Save prompt and response to database
        const promptId = nanoid();
        const timestamp = new Date();
        
        await storage.savePrompt({
          id: promptId,
          prompt,
          language: language || "Any Language",
          response: responseText,
          timestamp
        });
        
        // Return the code snippets
        res.json({
          success: true,
          snippets: codeSnippets,
          promptId
        });
      } catch (error: any) {
        console.error("OpenAI API error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Error generating code. Please try again." 
        });
      }
    } catch (error: any) {
      console.error("Error in /api/generate:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get user prompt history
  app.get("/api/history", async (req, res) => {
    try {
      const historyItems = await storage.getHistory();
      
      // Group history items by date
      const groupedItems = historyItems.map(item => {
        const date = new Date(item.timestamp);
        return {
          id: item.id,
          prompt: item.prompt,
          language: item.language,
          timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : date.toLocaleDateString()
        };
      });
      
      res.json({ items: groupedItems });
    } catch (error: any) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Error fetching history" });
    }
  });

  // Get a specific prompt by ID
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const prompt = await storage.getPromptById(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      // Parse code snippets from the response
      const codeSnippets = parseCodeSnippets(prompt.response);
      
      res.json({
        success: true,
        prompt: prompt.prompt,
        language: prompt.language,
        snippets: codeSnippets
      });
    } catch (error: any) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ message: "Error fetching prompt" });
    }
  });

  // Connect Git provider
  app.post("/api/connect", async (req, res) => {
    try {
      const { provider, token } = req.body;
      
      if (!provider || !token) {
        return res.status(400).json({ message: "Provider and token are required" });
      }
      
      // In a real app, you'd verify the token and store it securely
      // For now, we'll just mock a successful connection
      res.json({ 
        success: true, 
        message: `Successfully connected to ${provider}` 
      });
    } catch (error: any) {
      console.error("Error connecting Git provider:", error);
      res.status(500).json({ message: "Error connecting Git provider" });
    }
  });

  // Get user profile
  app.get("/api/user", async (req, res) => {
    try {
      // Mock user data for now
      const user = {
        id: "user-1",
        username: "codecraft_user",
        name: "Code Craft",
        email: "user@codecraft.example",
        avatar: "https://github.com/shadcn.png"
      };
      
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile" });
    }
  });

  // Generate React project
  app.post("/api/generate/react", async (req, res) => {
    try {
      const { name, description, author } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          success: false, 
          message: "Project name is required" 
        });
      }

      const result = await generateReactProject({
        name,
        description: description || "",
        author: author || ""
      });

      res.json({
        success: true,
        message: result.message,
        path: result.path
      });
    } catch (error: any) {
      console.error("Error generating React project:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error generating React project" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to check if a date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

// Helper function to check if a date is yesterday
function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
}

// Helper function to parse code snippets from the response
function parseCodeSnippets(text: string): any[] {
  // Regular expression to match code blocks with filenames
  const fileCodeBlockRegex = /```(?:(\w+)\s+)?(?:(.+?)\n)?([\s\S]+?)```/g;
  const snippets: any[] = [];
  let match;
  let count = 0;

  while ((match = fileCodeBlockRegex.exec(text)) !== null) {
    count++;
    let language = match[1] || "plaintext";
    let filename = match[2];
    const code = match[3].trim();

    // If filename appears to be part of the code, move it back
    let finalCode = code;
    let finalFilename = filename;
    if (finalFilename && !finalFilename.includes(".") && !finalCode.startsWith("#") && !finalCode.startsWith("//")) {
      finalCode = finalFilename + "\n" + finalCode;
      finalFilename = "";
    }

    // Determine filename if not explicitly provided
    if (!finalFilename) {
      // Try to infer filename from code
      const fileExtMap: {[key: string]: string} = {
        "javascript": "script.js",
        "js": "script.js",
        "typescript": "script.ts",
        "ts": "script.ts",
        "jsx": "component.jsx",
        "tsx": "component.tsx",
        "python": "script.py",
        "py": "script.py",
        "html": "index.html",
        "css": "styles.css",
        "json": "data.json",
        "java": "Main.java",
        "c": "main.c",
        "cpp": "main.cpp",
        "csharp": "Program.cs",
        "cs": "Program.cs",
        "php": "index.php",
        "ruby": "script.rb",
        "go": "main.go",
        "rust": "main.rs",
        "swift": "main.swift",
        "kotlin": "Main.kt",
        "plaintext": `file${count}.txt`
      };
      
      finalFilename = fileExtMap[language.toLowerCase()] || `file${count}.txt`;
    }

    snippets.push({
      id: nanoid(),
      filename: finalFilename,
      code: finalCode,
      language: language.charAt(0).toUpperCase() + language.slice(1)
    });
  }

  // If no code blocks with triple backticks, check for indented code
  if (snippets.length === 0) {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let currentCode = "";
    let currentLanguage = "";
    let currentFilename = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith("File:") || line.trim().startsWith("Filename:")) {
        if (inCodeBlock && currentCode.trim()) {
          snippets.push({
            id: nanoid(),
            filename: currentFilename || `file${snippets.length + 1}.txt`,
            code: currentCode.trim(),
            language: currentLanguage || "Plaintext"
          });
        }
        
        currentCode = "";
        currentFilename = line.split(":")[1].trim();
        inCodeBlock = true;
        
        // Try to determine language from filename extension
        const ext = currentFilename.split(".").pop()?.toLowerCase();
        const langMap: {[key: string]: string} = {
          "js": "JavaScript",
          "ts": "TypeScript",
          "jsx": "JavaScript",
          "tsx": "TypeScript",
          "py": "Python",
          "html": "HTML",
          "css": "CSS",
          "java": "Java",
          "c": "C",
          "cpp": "C++",
          "cs": "C#",
          "php": "PHP",
          "rb": "Ruby",
          "go": "Go",
          "rs": "Rust",
          "swift": "Swift",
          "kt": "Kotlin"
        };
        currentLanguage = ext ? (langMap[ext] || ext.charAt(0).toUpperCase() + ext.slice(1)) : "Plaintext";
      } else if (inCodeBlock) {
        currentCode += line + "\n";
      }
    }
    
    // Add the last code block if there is one
    if (inCodeBlock && currentCode.trim()) {
      snippets.push({
        id: nanoid(),
        filename: currentFilename || `file${snippets.length + 1}.txt`,
        code: currentCode.trim(),
        language: currentLanguage || "Plaintext"
      });
    }
  }

  // If still no snippets, use the whole text as a single snippet
  if (snippets.length === 0 && text.trim()) {
    snippets.push({
      id: nanoid(),
      filename: "snippet.txt",
      code: text.trim(),
      language: "Plaintext"
    });
  }

  return snippets;
}
