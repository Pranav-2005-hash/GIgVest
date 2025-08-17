import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Brain, Users, TrendingUp, Shield, Smartphone } from "lucide-react";
import roundupIcon from "@/assets/roundup-icon.jpg";
import aiCreditIcon from "@/assets/ai-credit-icon.jpg";
import communityIcon from "@/assets/community-icon.jpg";

const Features = () => {
  const features = [
    {
      icon: <Coins className="h-8 w-8 text-warning" />,
      image: roundupIcon,
      title: "Spare Change Round-Up",
      description: "Every transaction gets rounded up and automatically invested in low-risk government bonds, ETFs, and gold tokens.",
      highlight: "Start with just ₹1"
    },
    {
      icon: <Brain className="h-8 w-8 text-accent" />,
      image: aiCreditIcon,
      title: "AI-Powered Credit Scoring",
      description: "Our ML algorithms analyze your income patterns and investment behavior to build a dynamic credit profile.",
      highlight: "Access better loans"
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      image: communityIcon,
      title: "Community Safety Net",
      description: "Join a community-driven financial safety net with pooled micro-contributions for emergency funds.",
      highlight: "Mutual support system"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Smart Investment Portfolio",
      description: "Diversified portfolio automatically balanced based on your risk profile and financial goals.",
      highlight: "Professional management"
    },
    {
      icon: <Shield className="h-8 w-8 text-success" />,
      title: "Bank-Grade Security",
      description: "End-to-end encryption, regulatory compliance, and secure UPI integration for complete peace of mind.",
      highlight: "100% secure"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-accent" />,
      title: "Real-Time Insights",
      description: "Track your investments, credit score growth, and get personalized financial advice through our mobile app.",
      highlight: "Always connected"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            Powerful Features for{" "}
            <span className="text-gradient-hero">Gig Workers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to build wealth, improve credit, and secure your financial future - 
            designed specifically for the gig economy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-card transition-smooth group">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  {feature.icon}
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                {feature.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;