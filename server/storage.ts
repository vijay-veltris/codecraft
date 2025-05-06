import { db } from "@db";
import { prompts, history, gitConnections } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface PromptData {
  id: string;
  prompt: string;
  language: string;
  response: string;
  timestamp: Date;
}

export const storage = {
  savePrompt: async (data: PromptData) => {
    try {
      // Insert into prompts table
      const [savedPrompt] = await db.insert(prompts).values({
        id: data.id,
        prompt: data.prompt,
        language: data.language,
        response: data.response,
        timestamp: data.timestamp
      }).returning();
      
      // Add to history
      await db.insert(history).values({
        promptId: data.id,
        timestamp: data.timestamp
      });
      
      return savedPrompt;
    } catch (error) {
      console.error("Error saving prompt:", error);
      throw error;
    }
  },
  
  getHistory: async () => {
    try {
      // Get history with prompt details
      const historyItems = await db.query.history.findMany({
        orderBy: (history, { desc }) => [desc(history.timestamp)],
        with: {
          prompt: true
        }
      });
      
      return historyItems.map(item => ({
        id: item.promptId,
        prompt: item.prompt.prompt,
        language: item.prompt.language,
        timestamp: item.timestamp
      }));
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  },
  
  getPromptById: async (id: string) => {
    try {
      const prompt = await db.query.prompts.findFirst({
        where: eq(prompts.id, id)
      });
      
      return prompt;
    } catch (error) {
      console.error("Error fetching prompt:", error);
      throw error;
    }
  },
  
  saveGitConnection: async (userId: string, provider: string, token: string) => {
    try {
      const [connection] = await db.insert(gitConnections).values({
        userId,
        provider,
        token,
        connectedAt: new Date()
      }).returning();
      
      return connection;
    } catch (error) {
      console.error("Error saving git connection:", error);
      throw error;
    }
  },
  
  getGitConnections: async (userId: string) => {
    try {
      const connections = await db.query.gitConnections.findMany({
        where: eq(gitConnections.userId, userId)
      });
      
      return connections;
    } catch (error) {
      console.error("Error fetching git connections:", error);
      throw error;
    }
  }
};
