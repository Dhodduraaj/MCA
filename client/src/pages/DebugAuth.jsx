import React, { useState } from 'react';
import axios from 'axios';

const DebugAuth = () => {
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toISOString() }]);
  };

  const testBackendConnection = async () => {
    try {
      addResult('Backend Connection', 'Testing...', 'Checking if backend is reachable...');
      const response = await axios.get('http://localhost:5000/api/auth/login');
      addResult('Backend Connection', 'Success', 'Backend is reachable');
    } catch (error) {
      addResult('Backend Connection', 'Error', `Backend error: ${error.message}`);
    }
  };

  const testGoogleAuth = async () => {
    try {
      addResult('Google Auth', 'Testing...', 'Testing Google OAuth endpoint...');
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        token: 'test-token'
      });
      addResult('Google Auth', 'Success', 'Google OAuth endpoint is working');
    } catch (error) {
      addResult('Google Auth', 'Error', `Google OAuth error: ${error.response?.data?.message || error.message}`);
    }
  };

  const testGitHubAuth = async () => {
    try {
      addResult('GitHub Auth', 'Testing...', 'Testing GitHub OAuth endpoint...');
      const response = await axios.post('http://localhost:5000/api/auth/github', {
        code: 'test-code'
      });
      addResult('GitHub Auth', 'Success', 'GitHub OAuth endpoint is working');
    } catch (error) {
      addResult('GitHub Auth', 'Error', `GitHub OAuth error: ${error.response?.data?.message || error.message}`);
    }
  };

  const testEnvironmentVariables = () => {
    const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    addResult('Environment Variables', githubClientId ? 'Success' : 'Error', 
      `GitHub Client ID: ${githubClientId || 'Not set'}`);
  };

  const runAllTests = async () => {
    setTestResults([]);
    testEnvironmentVariables();
    await testBackendConnection();
    await testGoogleAuth();
    await testGitHubAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Authentication Debug</h1>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <button
            onClick={runAllTests}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Run All Tests
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                result.status === 'Success' ? 'bg-green-100 text-green-800' :
                result.status === 'Error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{result.test}</strong> - {result.status}
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
