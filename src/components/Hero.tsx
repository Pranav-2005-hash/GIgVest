import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary-lighter/20 to-secondary-lighter/20 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Turn Your{" "}
                <span className="text-gradient-hero">Spare Change</span>{" "}
                Into Future Wealth
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The fintech platform designed for gig workers. Automatically invest your spare change, 
                build credit, and secure your financial future with AI-powered insights.
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>₹0 minimum investment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Build credit score</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span>AI-powered savings</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Investing Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">₹2.5Cr+</div>
                <div className="text-sm text-muted-foreground">Invested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">4.8★</div>
                <div className="text-sm text-muted-foreground">App Rating</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="GigVest - Fintech for Gig Workers"
                className="w-full h-auto rounded-2xl shadow-hero"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;