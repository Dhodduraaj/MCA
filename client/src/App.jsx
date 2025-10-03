import { useEffect, useState } from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
} from "react-router-dom";
import Chatbot from "./components/chatbot"; // chatbot component
import Navbar from "./components/Navbar";
import { FinanceProvider, useFinance } from "./context/FinanceContext";
import BudgetManagement from "./pages/BudgetManagement";
import CalendarPage from "./pages/CalendarPage";
import DebugAuth from "./pages/DebugAuth";
import EcoSurvey from "./pages/EcoSurvey";
import GitHubCallback from "./pages/GitHubCallback";
import HomePage from "./pages/HomePage"; // Public Landing Page
import LandingPage from "./pages/LandingPage"; // Dashboard
import Locator from "./pages/Locator";
import Login from "./pages/Login";
import MySpace from "./pages/MySpace";
import Register from "./pages/Register";
import TestAuth from "./pages/TestAuth";
import TransactionManagement from "./pages/TransactionManagement";

function AppWrapper() {
  return (
    <FinanceProvider>
      <Router>
        <App />
      </Router>
    </FinanceProvider>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { loadUserData } = useFinance();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(token);
      loadUserData();
    }
    setLoading(false);
  }, [loadUserData]);

  // Hide navbar & chatbot on login/register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  if (loading) return null;

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <HomePage />}
        />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/debug" element={<DebugAuth />} />
        <Route path="/test" element={<TestAuth />} />
        <Route path="/calendar" element={<CalendarPage />} />

        {/* Protected routes → redirect to "/" when not logged in */}
        <Route
          path="/dashboard"
          element={user ? <LandingPage /> : <Navigate to="/" />}
        />
        <Route
          path="/transactions"
          element={user ? <TransactionManagement /> : <Navigate to="/" />}
        />
        <Route
          path="/budgets"
          element={user ? <BudgetManagement /> : <Navigate to="/" />}
        />
        <Route
          path="/myspace"
          element={user ? <MySpace /> : <Navigate to="/" />}
        />
        <Route
          path="/locator"
          element={user ? <Locator /> : <Navigate to="/" />}
        />
        <Route
          path="/eco-survey"
          element={user ? <EcoSurvey /> : <Navigate to="/" />}
        />
      </Routes>

      {!hideNavbar && <Chatbot />}
    </>
  );
}

export default AppWrapper;
