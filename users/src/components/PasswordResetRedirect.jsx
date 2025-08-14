import React, { useState } from 'react';

function PasswordResetRedirect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from URL
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    // Extract the token from path like /reset-password/TOKEN
    const tokenMatch = path.match(/\/reset-password\/(.+)/);
    return tokenMatch ? tokenMatch[1] : null;
  };

  // This component will run in the browser
  React.useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      // Redirect to the main app with the token as a query parameter
      window.location.href = `/?page=reset-password&token=${token}`;
    } else {
      setError('Invalid reset password link');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-4">Redirecting to password reset page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <p className="text-sm mt-2">
            <a href="/" className="text-blue-500 hover:underline">
              Return to home page
            </a>
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default PasswordResetRedirect;
