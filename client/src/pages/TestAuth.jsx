import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';

const TestAuth = () => {
  const [token, setToken] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const { loadUserData } = useFinance();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const testBudgetCreation = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: 'Test',
          monthlyLimit: 1000,
          period: 'monthly'
        })
      });

      const data = await response.json();
      setTestResult({ success: true, data });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  const testDataLoad = async () => {
    try {
      await loadUserData();
      setTestResult({ success: true, message: 'Data load attempted' });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-4">
        <p><strong>Token:</strong> {token ? 'Present' : 'Not found'}</p>
        <p><strong>Token value:</strong> {token ? token.substring(0, 20) + '...' : 'N/A'}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={testBudgetCreation}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Budget Creation
        </button>
        
        <button
          onClick={testDataLoad}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Data Load
        </button>
      </div>

      {testResult && (
        <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-bold">{testResult.success ? 'Success' : 'Error'}</h3>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAuth;
