import { useAuth } from '@/hooks/useAuth';
import AuthenticatedHeader from '@/components/AuthenticatedHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Users, 
  LogOut, 
  Home,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
  const { user, signOut } = useAuth();

  const mockPosts = [
    {
      id: 1,
      type: 'success_story',
      title: 'Paid off $15k in credit card debt!',
      content: 'After 18 months of budgeting and side hustles, I finally paid off all my credit card debt. The key was tracking every expense and finding extra income through freelancing.',
      author: 'Sarah M.',
      upvotes: 124,
      downvotes: 2,
      comments: 18,
      timeAgo: '2 hours ago',
    },
    {
      id: 2,
      type: 'tip',
      title: 'Use the 50/30/20 rule for budgeting',
      content: '50% for needs, 30% for wants, 20% for savings and debt repayment. This simple rule has transformed my financial life!',
      author: 'Mike K.',
      upvotes: 89,
      downvotes: 5,
      comments: 12,
      timeAgo: '4 hours ago',
    },
    {
      id: 3,
      type: 'question',
      title: 'Best investment apps for beginners?',
      content: 'I\'m new to investing and looking for user-friendly apps. What do you recommend for someone starting with $500?',
      author: 'Alex R.',
      upvotes: 45,
      downvotes: 1,
      comments: 23,
      timeAgo: '6 hours ago',
    },
    {
      id: 4,
      type: 'resource',
      title: 'Free budgeting spreadsheet template',
      content: 'I created a comprehensive budgeting spreadsheet that tracks income, expenses, and savings goals. Link in comments!',
      author: 'Emma L.',
      upvotes: 203,
      downvotes: 8,
      comments: 31,
      timeAgo: '1 day ago',
    },
  ];

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'success_story': return 'bg-success/10 text-success';
      case 'tip': return 'bg-accent/10 text-accent';
      case 'question': return 'bg-warning/10 text-warning-foreground';
      case 'resource': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'success_story': return <Star className="h-3 w-3" />;
      case 'tip': return <TrendingUp className="h-3 w-3" />;
      case 'question': return <MessageCircle className="h-3 w-3" />;
      case 'resource': return <Share2 className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-success">+127 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Today</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">Across all topics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Ranking</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#247</div>
              <p className="text-xs text-success">↑ 15 positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feed" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="feed">Latest Posts</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            </TabsList>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          <TabsContent value="feed">
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author}</p>
                          <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={getPostTypeColor(post.type)}
                      >
                        {getPostTypeIcon(post.type)}
                        <span className="ml-1 capitalize">{post.type.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{post.content}</p>
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.upvotes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {post.downvotes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                  <CardDescription>Most discussed topics this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">Debt Payoff Strategies</p>
                          <p className="text-sm text-muted-foreground">234 discussions</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Hot</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">First-time Investing</p>
                          <p className="text-sm text-muted-foreground">189 discussions</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Rising</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-warning-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Budgeting Apps</p>
                          <p className="text-sm text-muted-foreground">156 discussions</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Popular</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="my-posts">
            <Card>
              <CardHeader>
                <CardTitle>Your Posts</CardTitle>
                <CardDescription>Posts and contributions you've made</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your financial journey with the community!
                  </p>
                  <Button>Create Your First Post</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityPage;