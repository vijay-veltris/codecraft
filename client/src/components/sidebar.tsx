import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchHistory } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";

interface HistoryItem {
  id: string;
  prompt: string;
  language: string;
  timestamp: string;
  date: string;
}

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: history, isLoading } = useQuery({
    queryKey: ['/api/history'],
    queryFn: fetchHistory,
  });

  const filteredHistory = history?.items?.filter((item: HistoryItem) => 
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group history items by date
  const groupedHistory: Record<string, HistoryItem[]> = {};
  filteredHistory.forEach((item: HistoryItem) => {
    if (!groupedHistory[item.date]) {
      groupedHistory[item.date] = [];
    }
    groupedHistory[item.date].push(item);
  });

  const handleHistoryItemClick = (promptId: string) => {
    queryClient.invalidateQueries({ queryKey: [`/api/prompts/${promptId}`] });
  };

  return (
    <div 
      className={`flex flex-col ${expanded ? 'w-64' : 'w-0'} bg-sidebar transition-all duration-300 h-full overflow-hidden`}
      style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            CC
          </div>
          <h1 className="ml-2 font-semibold text-lg text-sidebar-foreground">CodeCraft</h1>
        </div>
        <button 
          onClick={onToggle} 
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-medium text-sm text-sidebar-foreground/70 mb-2">HISTORY</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search history"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sidebar-accent text-sm rounded-md border border-sidebar-border py-2 pl-8 pr-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2.5 text-sidebar-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-2">
            {Object.keys(groupedHistory).length === 0 ? (
              <div className="text-center py-6 text-sidebar-foreground/50 text-sm">
                <p>No history found</p>
              </div>
            ) : (
              Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3 mt-6 first:mt-0">
                    {date}
                  </h3>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="history-item mb-3 p-2 hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors"
                      onClick={() => handleHistoryItemClick(item.id)}
                    >
                      <p className="text-sm font-medium text-sidebar-foreground truncate">{item.prompt}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-sidebar-foreground/70">{item.language || "Any"}</span>
                        <span className="text-xs text-sidebar-foreground/70">{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
