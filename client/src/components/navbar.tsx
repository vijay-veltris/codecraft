import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onExpandSidebar: () => void;
  sidebarExpanded: boolean;
}

export function Navbar({ onExpandSidebar, sidebarExpanded }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [gitDropdownOpen, setGitDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {!sidebarExpanded && (
            <button 
              onClick={onExpandSidebar} 
              className="text-muted-foreground hover:text-foreground p-1 rounded-md mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          <div className="relative mx-2">
            <DropdownMenu open={gitDropdownOpen} onOpenChange={setGitDropdownOpen}>
              <DropdownMenuTrigger className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-card hover:bg-accent transition-colors focus:outline-none">
                Connect Git
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className="w-5 h-5 mr-3" alt="GitHub" />
                  GitHub
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <img src="https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png" className="w-5 h-5 mr-3" alt="GitLab" />
                  GitLab
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <img src="https://wac-cdn.atlassian.com/assets/img/favicons/bitbucket/favicon-32x32.png" className="w-5 h-5 mr-3" alt="Bitbucket" />
                  Bitbucket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-muted-foreground">Light</span>
            <Switch 
              id="theme-toggle" 
              checked={theme === "dark"} 
              onCheckedChange={toggleTheme}
            />
            <span className={`ml-2 text-sm ${theme === "dark" ? "font-medium text-foreground" : "text-muted-foreground"}`}>Dark</span>
          </div>

          <div className="relative">
            <DropdownMenu open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
              <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">Your Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
