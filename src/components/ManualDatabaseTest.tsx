import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ManualDatabaseTest = () => {
  const [testing, setTesting] = useState(false);
  const [testAmount, setTestAmount] = useState('199.50');
  const [testCategory, setTestCategory] = useState('Test Payment');
  const [results, setResults] = useState<{
    directInsert: boolean | null;
    directQuery: boolean | null;
    edgeFunction: boolean | null;
  }>({
    directInsert: null,
    directQuery: null,
    edgeFunction: null
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const runManualTests = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to run tests',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    setResults({ directInsert: null, directQuery: null, edgeFunction: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session available');
      }

      // Test 1: Direct Database Insert
      console.log('Testing direct database insert...');
      const { data: insertData, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(testAmount),
          category: testCategory,
          date: new Date().toISOString().split('T')[0],
          description: 'Manual Test Transaction',
          type: 'expense',
          round_up_amount: 0.50,
          round_up_applied: true
        })
        .select()
        .single();

      setResults(prev => ({ ...prev, directInsert: !insertError }));
      
      if (insertError) {
        console.error('Direct insert failed:', insertError);
      } else {
        console.log('Direct insert successful:', insertData);
      }

      // Test 2: Direct Database Query
      console.log('Testing direct database query...');
      const { data: queryData, error: queryError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setResults(prev => ({ ...prev, directQuery: !queryError }));
      
      if (queryError) {
        console.error('Direct query failed:', queryError);
      } else {
        console.log('Direct query successful:', queryData?.length || 0, 'transactions');
      }

      // Test 3: Edge Function
      console.log('Testing Edge Function...');
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('transactions', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      setResults(prev => ({ ...prev, edgeFunction: !edgeError }));
      
      if (edgeError) {
        console.error('Edge Function failed:', edgeError);
      } else {
        console.log('Edge Function successful:', edgeData?.transactions?.length || 0, 'transactions');
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
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Manual Database Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testAmount">Test Amount (₹)</Label>
            <Input
              id="testAmount"
              type="number"
              step="0.01"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              placeholder="199.50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testCategory">Test Category</Label>
            <Input
              id="testCategory"
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              placeholder="Test Payment"
            />
          </div>
        </div>

        <Button onClick={runManualTests} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Manual Tests...
            </>
          ) : (
            'Run Manual Database Tests'
          )}
        </Button>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Direct Database Insert</span>
            {results.directInsert === null ? (
              <span className="text-muted-foreground">Not tested</span>
            ) : results.directInsert ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Direct Database Query</span>
            {results.directQuery === null ? (
              <span className="text-muted-foreground">Not tested</span>
            ) : results.directQuery ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Edge Function</span>
            {results.edgeFunction === null ? (
              <span className="text-muted-foreground">Not tested</span>
            ) : results.edgeFunction ? (
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
              <strong>Email:</strong> {user.email}<br/>
              <strong>Note:</strong> This test will create a real transaction in your database.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualDatabaseTest;
