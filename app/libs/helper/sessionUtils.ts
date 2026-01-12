export const clearSessionAndRedirect = () => {
  const currentPageUrl = typeof window !== "undefined" ? window.location.pathname : "";
  
  // Clear any session-related data from storage
  if (typeof window !== "undefined") {
    // Clear localStorage items if you're using them
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear cookies if you're using them
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Redirect if not already on auth pages
    if (currentPageUrl !== "/signin" && currentPageUrl !== "/signup") {
      window.location.replace("/signin");
    }
  }
};