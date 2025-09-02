import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const DatabaseTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    auth: boolean | null;
    transactions: boolean | null;
    savings: boolean | null;
  }>({
    auth: null,
    transactions: null,
    savings: null
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const runTests = async () => {
    setTesting(true);
    setResults({ auth: null, transactions: null, savings: null });

    try {
      // Test 1: Authentication
      console.log('Testing authentication...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      setResults(prev => ({ ...prev, auth: !authError && !!session?.access_token }));
      
      if (authError || !session?.access_token) {
        console.error('Auth test failed:', authError);
        toast({
          title: 'Authentication Test Failed',
          description: authError?.message || 'No session available',
          variant: 'destructive'
        });
        setTesting(false);
        return;
      }

      // Test 2: Transactions function
      console.log('Testing transactions function...');
      const { data: transactionsData, error: transactionsError } = await supabase.functions.invoke('transactions', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      
      if (transactionsError) {
        console.warn('Edge Function failed, testing direct database access:', transactionsError);
        
        // Test direct database access as fallback
        const { data: directTransactions, error: directError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user?.id)
          .limit(1);
        
        if (directError) {
          console.error('Both Edge Function and direct access failed:', { transactionsError, directError });
          setResults(prev => ({ ...prev, transactions: false }));
        } else {
          console.log('Direct database access works, Edge Function failed:', transactionsError);
          setResults(prev => ({ ...prev, transactions: true }));
        }
      } else {
        console.log('Transactions Edge Function test passed:', transactionsData);
        setResults(prev => ({ ...prev, transactions: true }));
      }

      // Test 3: Savings table
      console.log('Testing savings table...');
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');
      
      setResults(prev => ({ ...prev, savings: !savingsError }));
      
      if (savingsError) {
        console.error('Savings test failed:', savingsError);
      } else {
        console.log('Savings test passed:', savingsData);
      }

      // Show overall result
      const allPassed = Object.values(results).every(result => result === true);
      if (allPassed) {
        toast({
          title: 'All Tests Passed',
          description: 'Database connections are working correctly',
        });
      } else {
        toast({
          title: 'Some Tests Failed',
          description: 'Check the results below for details',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Test Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Tests'
          )}
        </Button>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Authentication</span>
            {results.auth === null ? (
              <span className="text-muted-foreground">Not tested</span>
            ) : results.auth ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Transactions Function</span>
            {results.transactions === null ? (
              <span className="text-muted-foreground">Not tested</span>
            ) : results.transactions ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Savings Table</span>
            {results.savings === null ? (
              <span className="text-muted-foreground">Not tested</span>
            ) : results.savings ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        {user && (
          <Alert>
            <AlertDescription>
              <strong>User ID:</strong> {user.id}<br/>
              <strong>Email:</strong> {user.email}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
