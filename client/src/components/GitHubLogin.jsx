import React from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

const GitHubLogin = ({ onSuccess, onError }) => {
  const handleGitHubLogin = () => {
    console.log('GitHub login button clicked!');
    
    // GitHub OAuth configuration
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liVpmFjzBXdvMQZq';
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    
    console.log('GitHub OAuth - Client ID:', clientId);
    console.log('GitHub OAuth - Redirect URI:', redirectUri);
    console.log('GitHub OAuth - Window origin:', window.location.origin);
    console.log('GitHub OAuth - Environment variable:', import.meta.env.VITE_GITHUB_CLIENT_ID);
    
    // GitHub OAuth URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    
    console.log('GitHub OAuth URL:', githubAuthUrl);
    
    // Test if we can open a simple popup first
    console.log('Attempting to open popup window...');
    
    // Open GitHub OAuth in a popup window
    const popup = window.open(
      githubAuthUrl,
      'github-login',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    );

    console.log('Popup window object:', popup);

    if (!popup) {
      console.error('Failed to open popup window - likely blocked by browser');
      alert('Popup blocked! Please allow popups for this site and try again.');
      if (onError) {
        onError('Failed to open popup window. Please check your popup blocker.');
      }
      return;
    }

    console.log('Popup opened successfully');

    // Listen for the popup to close or receive a message
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Handle case where user closed popup without completing login
        if (onError) {
          onError('Login cancelled');
        }
      }
    }, 1000);

    // Listen for messages from the popup
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        
        if (onSuccess) {
          onSuccess(event.data.code);
        }
      } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        
        if (onError) {
          onError(event.data.error);
        }
      }
    };

    window.addEventListener('message', messageListener);
  };

  return (
    <motion.button
      type="button"
      onClick={handleGitHubLogin}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
    >
      <Github className="h-5 w-5" />
      Continue with GitHub
    </motion.button>
  );
};

export default GitHubLogin;
