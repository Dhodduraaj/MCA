import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GitHubLogin from "../components/GitHubLogin";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.token);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };


    const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google credential response:", credentialResponse);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google User:", decoded);

      // send token to backend to verify + generate your own JWT
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: credentialResponse.credential,
      });

      console.log("Backend response:", res.data);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.token);
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      console.error("Error response:", err.response?.data);
      alert(`Google login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleGitHubSuccess = async (code) => {
    try {
      console.log("GitHub code received:", code);

      // send code to backend to exchange for access token and get user data
      const res = await axios.post("http://localhost:5000/api/auth/github", {
        code: code,
      });

      console.log("GitHub backend response:", res.data);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.token);
      navigate("/");
    } catch (err) {
      console.error("GitHub login error:", err);
      console.error("GitHub error response:", err.response?.data);
      alert(`GitHub login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleGitHubError = (error) => {
    console.error("GitHub login error:", error);
    alert(`GitHub login failed: ${error}`);
  };

  
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl w-96 p-10 flex flex-col items-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-[#7209b7] mb-6"
        >
          Login
        </motion.h2>

        <motion.input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-[#7209b7] outline-none shadow-sm transition"
          whileFocus={{ scale: 1.02 }}
        />

        <motion.input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border-2 border-gray-300 rounded-lg focus:border-[#7209b7] outline-none shadow-sm transition"
          whileFocus={{ scale: 1.02 }}
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-[#7209b7] to-[#9d4edd] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Login
        </motion.button>


        <div className="my-4 text-gray-500 text-sm">or</div>

        <div className="w-full space-y-3">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed")}
            />
          </div>
          
          <GitHubLogin
            onSuccess={handleGitHubSuccess}
            onError={handleGitHubError}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-gray-600 text-sm cursor-pointer hover:text-[#7209b7] transition"
          onClick={() => navigate("/register")}
        >
          Don’t have an account? Register
        </motion.p>
      </motion.form>
    </div>
  );
}

export default Login;
