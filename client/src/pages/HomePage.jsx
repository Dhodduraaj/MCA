import { motion } from "framer-motion";
import { Code2, Github, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  // 👇 Team Data
  const team = [
    {
      name: "Dhodduraaj SP",
      dept: "Computer Science & Design",
      img: "/bm.jpg",
      github: "https://github.com/Prabu-21",
      linkedin: "https://www.linkedin.com/in/dhodduraaj-s-p-08a9b7347/",
      leetcode: "https://leetcode.com/username",
    },
    {
      name: "Dharnish BM",
      dept: "Information Technology",
      img: "/bm.jpg",
      github: "https://github.com/Dharnish-BM",
      linkedin: "https://www.linkedin.com/in/dharnishbm2911/",
      leetcode: "https://leetcode.com/u/dharnishbm/",
    },
    {
      name: "Dharun Suriya T",
      dept: "Computer Science & Design",
      img: "/bm.jpg",
      github: "https://github.com/DhurgashreeIyappan",
      linkedin: "https://www.linkedin.com/in/dharunsuriya-t-4916bb34b/",
      leetcode: "https://leetcode.com/username",
    },
    {
      name: "Arun S",
      dept: "Information Technology",
      img: "/ar.jpg",
      github: "https://github.com/Arun2005s",
      linkedin: "https://www.linkedin.com/in/arun2005s/",
      leetcode: "https://leetcode.com/username",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] flex flex-col">
      {/* ================= Hero Section ================= */}
      <section
        id="hero"
        className="flex-1 flex items-center justify-center px-6 pt-28 pb-20"
      >
        <div className="max-w-3xl w-full text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold text-[#2b2d42] tracking-tight leading-tight"
          >
            Welcome to <span className="text-[#2e7d32]">Greefin</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-[#2b2d42]/80 leading-relaxed"
          >
            Your personal <span className="font-semibold text-[#2e7d32]">eco-friendly finance tracker </span> 
            designed to help you stay on top of your expenses, savings, and investments.  
            With Greefin, managing money becomes simple, smart, and eco-friendly 🌳.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
          >
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 rounded-xl text-white font-semibold shadow-lg text-lg bg-gradient-to-r from-[#2e7d32] to-[#4caf50] hover:scale-105 hover:shadow-xl transition"
            >
              Get Started
            </button>
            <a
              href="#team"
              className="px-10 py-4 rounded-xl text-[#2b2d42] font-semibold shadow-lg text-lg bg-white/70 hover:bg-white hover:scale-105 transition backdrop-blur-md"
            >
              Meet the Team
            </a>
          </motion.div>
        </div>
      </section>

      {/* ================= Team Section ================= */}
      <section id="team" className="w-full py-24 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center mb-16 px-6">
          <h2 className="text-4xl font-extrabold text-[#2b2d42]">
            Meet the Team 🚀
          </h2>
          <p className="mt-4 text-[#2e7d32]/80 text-lg max-w-2xl mx-auto">
  At <span className="font-semibold text-[#2e7d32]">Greefin</span>, we’re passionate 
  about building smarter tools that make managing money effortless 🌱 
  while inspiring sustainable choices for a brighter future.  
</p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-3 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl p-6 flex flex-col items-center text-center border border-white/60 hover:border-[#2e7d32]/40"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-40 h-40 object-cover rounded-full shadow-lg mb-5 border-4 border-white"
              />
              <h3 className="text-lg font-bold text-gray-800">
                {member.name}
              </h3>
              <p className="text-sm text-gray-600">{member.dept}</p>

              <div className="flex gap-4 mt-4">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white shadow hover:bg-[#f1f1f1] transition"
                >
                  <Github className="w-5 h-5 text-gray-700" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white shadow hover:bg-[#f1f1f1] transition"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                </a>
                <a
                  href={member.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white shadow hover:bg-[#f1f1f1] transition"
                >
                  <Code2 className="w-5 h-5 text-amber-500" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
