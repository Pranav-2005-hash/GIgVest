import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Coins,
  CalendarDays
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'savings' | 'investment';
  round_up_amount: number;
  round_up_applied: boolean;
  created_at: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchSavingsTotal();
    }

    // Listen for transaction completion events to refresh the list
    const handleTransactionCompleted = (event: any) => {
      console.log('Transaction completed, refreshing transaction history', event.detail);
      if (user) {
        fetchTransactions();
        fetchSavingsTotal();
      }
    };

    const handleDashboardRefresh = (event: any) => {
      console.log('Dashboard refresh event received in transaction history', event.detail);
      if (user) {
        fetchTransactions();
        fetchSavingsTotal();
      }
    };

    window.addEventListener('transactionCompleted', handleTransactionCompleted);
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('transactionCompleted', handleTransactionCompleted);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('transactions', {
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {}
      });

      if (error) {
        throw error;
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsTotal = async () => {
    try {
      const { data, error } = await supabase
        .from('savings')
        .select('current_amount')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (data && !error) {
        setTotalSavings(Number(data.current_amount) || 0);
      }
    } catch (error) {
      console.error('Error fetching savings:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'income' || type === 'savings') {
      return <ArrowUpRight className="h-4 w-4 text-success" />;
    }
    return <ArrowDownLeft className="h-4 w-4 text-destructive" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === 'income' || type === 'savings') {
      return 'bg-success/10';
    }
    return 'bg-destructive/10';
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const totalRoundUps = transactions.reduce((sum, transaction) => 
    sum + (transaction.round_up_applied ? Number(transaction.round_up_amount) : 0), 0
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Round-Up Savings</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{totalRoundUps.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {transactions.length === 0 
              ? "No transactions yet. Make your first payment to see history here."
              : `All your transactions with round-up savings details`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Start making transactions to build your financial history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || 'Transaction'}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.round_up_applied && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              <Coins className="h-3 w-3 mr-1" />
                              +₹{Number(transaction.round_up_amount).toFixed(2)} saved
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' || transaction.type === 'savings' ? 'text-success' : 'text-foreground'
                    }`}>
                      {transaction.type === 'income' || transaction.type === 'savings' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;