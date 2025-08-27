import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient-hero">GigVest</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-primary transition-smooth">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-smooth">
              How It Works
            </a>
            <a href="#dashboard" className="text-foreground hover:text-primary transition-smooth">
              Dashboard
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-smooth">
              Community
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-foreground hover:text-primary transition-smooth">
                Features
              </a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-smooth">
                How It Works
              </a>
              <a href="#dashboard" className="text-foreground hover:text-primary transition-smooth">
                Dashboard
              </a>
              <a href="#community" className="text-foreground hover:text-primary transition-smooth">
                Community
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Link to="/auth">
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;