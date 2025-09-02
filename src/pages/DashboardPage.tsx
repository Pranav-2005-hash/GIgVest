import { useAuth } from '@/hooks/useAuth';
import AuthenticatedHeader from '@/components/AuthenticatedHeader';
import Dashboard from '@/components/Dashboard';
import TransactionHistory from '@/components/TransactionHistory';
import DatabaseTest from '@/components/DatabaseTest';
import ManualDatabaseTest from '@/components/ManualDatabaseTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="debug">
            <div className="space-y-6">
              <DatabaseTest />
              <ManualDatabaseTest />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground">Advanced financial analytics and insights will be available here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;