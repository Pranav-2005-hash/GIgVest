import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Shield, TrendingUp, MessageCircle, Award } from "lucide-react";
import communityIcon from "@/assets/community-icon.jpg";

const Community = () => {
  const communityStats = [
    { icon: <Users className="h-6 w-6" />, label: "Active Members", value: "50,000+", color: "text-primary" },
    { icon: <Heart className="h-6 w-6" />, label: "Emergency Funds Provided", value: "₹2.5Cr", color: "text-secondary" },
    { icon: <Shield className="h-6 w-6" />, label: "Success Rate", value: "98.5%", color: "text-accent" },
    { icon: <TrendingUp className="h-6 w-6" />, label: "Average Growth", value: "15.2%", color: "text-success" }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Delivery Partner",
      location: "Delhi",
      message: "GigVest helped me build my credit score from 580 to 720 in just 8 months. Now I can get better loan rates!",
      rating: 5,
      investment: "₹15,200"
    },
    {
      name: "Priya Patel",
      role: "Freelance Designer",
      location: "Mumbai",
      message: "The emergency fund feature saved me during a medical emergency. The community support is incredible.",
      rating: 5,
      investment: "₹22,800"
    },
    {
      name: "Arjun Singh",
      role: "Cab Driver",
      location: "Bangalore",
      message: "I never thought I could invest with just spare change. Now I have a growing portfolio worth ₹18K!",
      rating: 5,
      investment: "₹18,400"
    }
  ];

  const emergencyFundFeatures = [
    "Instant access during emergencies",
    "No interest charges",
    "Community-backed guarantee",
    "Flexible repayment terms",
    "24/7 support available"
  ];

  return (
    <section id="community" className="py-20 bg-gradient-to-b from-muted/5 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            Join Our <span className="text-gradient-hero">Financial Community</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Be part of a supportive community where gig workers help each other build financial security 
            through collective investment and mutual support.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 text-center">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Fund Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold mb-4">Community Emergency Fund</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Every member contributes a small amount monthly to create a safety net for the community. 
                When you need emergency funds, the community has your back.
              </p>
            </div>

            <div className="space-y-3">
              {emergencyFundFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-card p-6 rounded-xl border border-border/50">
              <div className="flex items-center space-x-4 mb-4">
                <img src={communityIcon} alt="Community" className="w-12 h-12 rounded-lg" />
                <div>
                  <h4 className="font-semibold">How It Works</h4>
                  <p className="text-sm text-muted-foreground">Simple, transparent, effective</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Contribute ₹50-200 monthly based on your income</p>
                <p>• Access up to ₹50,000 in emergencies</p>
                <p>• Repay when your situation improves</p>
                <p>• Build stronger community bonds</p>
              </div>
            </div>
          </div>

          <Card className="bg-background border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-accent" />
                <span>Emergency Fund Status</span>
              </CardTitle>
              <CardDescription>Current community fund health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">₹2.5 Crore</div>
                <div className="text-sm text-muted-foreground">Total Fund Available</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-xl font-bold text-success">1,247</div>
                  <div className="text-xs text-muted-foreground">Funds Provided</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-xl font-bold text-primary">98.5%</div>
                  <div className="text-xs text-muted-foreground">Repayment Rate</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recent Success Stories</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Medical Emergency</p>
                      <p className="text-sm text-muted-foreground">Helped within 2 hours</p>
                    </div>
                    <Badge variant="secondary">₹25,000</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Vehicle Repair</p>
                      <p className="text-sm text-muted-foreground">Same day assistance</p>
                    </div>
                    <Badge variant="secondary">₹12,000</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="space-y-8 mb-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">What Our Community Says</h3>
            <p className="text-lg text-muted-foreground">Real stories from real gig workers building their financial future</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role} • {testimonial.location}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Award key={i} className="h-4 w-4 text-warning fill-current" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground italic">"{testimonial.message}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Portfolio Value</span>
                    <span className="font-bold text-secondary">{testimonial.investment}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6">
          <Card className="bg-gradient-hero text-white border-none max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h3>
              <p className="mb-6 opacity-90">
                Start your journey with thousands of gig workers who are building wealth and supporting each other.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Join Community
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Community;