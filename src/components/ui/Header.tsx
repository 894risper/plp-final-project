import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-semibold">Corruption Tracker</span>
                    </div>

                    <nav className="hidden items-center gap-6 md:flex">
                        <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            How It Works
                        </a>
                        <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            About
                        </a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost">Sign In</Button>
                        <Button>Get Started</Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
