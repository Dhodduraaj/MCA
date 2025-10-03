import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GitHubLogin from "../components/GitHubLogin";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleGitHubSuccess = async (code) => {
    try {
      console.log("GitHub code received:", code);

      // send code to backend to exchange for access token and get user data
      const res = await axios.post("http://localhost:5000/api/auth/github", {
        code: code,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error("GitHub login error:", err);
      alert("GitHub login failed");
    }
  };

  const handleGitHubError = (error) => {
    console.error("GitHub login error:", error);
    alert(`GitHub login failed: ${error}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
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
          Register
        </motion.h2>

        <motion.input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-3 border-2 border-gray-300 rounded-lg focus:border-[#7209b7] outline-none shadow-sm transition"
          whileFocus={{ scale: 1.02 }}
        />

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
          Register
        </motion.button>

        <div className="my-4 text-gray-500 text-sm">or</div>

        <GitHubLogin
          onSuccess={handleGitHubSuccess}
          onError={handleGitHubError}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-gray-600 text-sm cursor-pointer hover:text-[#7209b7] transition"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </motion.p>
      </motion.form>
    </div>
  );
}

export default Register;
