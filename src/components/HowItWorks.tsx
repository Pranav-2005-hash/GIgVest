import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, ArrowRight, TrendingUp, Target } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <CreditCard className="h-12 w-12 text-accent" />,
      title: "Link Your UPI/Cards",
      description: "Securely connect your payment methods. We use bank-grade security to protect your data.",
      example: "Example: Link PayTM, Google Pay, or your debit card"
    },
    {
      icon: <ArrowRight className="h-12 w-12 text-warning" />,
      title: "Automatic Round-Up",
      description: "Every transaction gets rounded up to the nearest rupee. The spare change is automatically set aside.",
      example: "₹187 food order → ₹13 spare change invested"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-secondary" />,
      title: "Smart Investment",
      description: "Your spare change is invested in diversified, low-risk portfolios of government bonds, ETFs, and gold.",
      example: "₹500 monthly spare change → ₹6,000+ annual investment"
    },
    {
      icon: <Target className="h-12 w-12 text-primary" />,
      title: "Build Credit & Wealth",
      description: "Consistent investments improve your credit score while building long-term wealth automatically.",
      example: "6 months → Improved credit score + growing portfolio"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/5">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            How <span className="text-gradient-hero">GigVest</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start building wealth in just 4 simple steps. No minimum investment, no complex processes.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-background border-border/50 hover:shadow-card transition-smooth h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gradient-card rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-sm text-primary font-medium">{step.example}</p>
                  </div>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center space-y-6">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border/50">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Financial Journey?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of gig workers who are already building wealth with GigVest
            </p>
            <Button variant="hero" size="lg">
              Get Started - It's Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;