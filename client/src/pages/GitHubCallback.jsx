import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('GitHub Callback - Code:', code);
    console.log('GitHub Callback - Error:', error);
    console.log('GitHub Callback - Window opener:', window.opener);

    if (error) {
      console.log('GitHub Callback - Sending error to parent');
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_ERROR',
        error: error
      }, window.location.origin);
    } else if (code) {
      console.log('GitHub Callback - Sending success code to parent');
      // Send success code to parent window
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
    } else {
      console.log('GitHub Callback - No code or error, sending generic error');
      // No code or error, send generic error
      window.opener?.postMessage({
        type: 'GITHUB_AUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
    }

    // Close the popup window
    setTimeout(() => {
      window.close();
    }, 1000);
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing GitHub login...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
