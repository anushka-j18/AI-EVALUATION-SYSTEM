import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  LayoutGrid,
  FileText,
  Bell,
  Settings,
  Moon,
  Sun,
  Users,
  Zap,
  ArrowUpRight,
  Heart,
  Bookmark,
  Share2,
  MapPin,
  BrainCircuit,
  Library,
  GraduationCap
} from "lucide-react";

function Dashboard() {
  const [activeView, setActiveView] = useState("teacher"); // "teacher" or "student"

  return (
    <div className="w-full h-screen bg-gray-200 p-4 sm:p-6 flex gap-4 overflow-hidden relative">

        {/* Right Content Area (Hero Image & Overlay Cards) */}
        <div 
          className="flex-1 h-full rounded-[2.5rem] relative overflow-hidden shadow-inner"
          style={{ 
            backgroundColor: '#f8fafc',
            backgroundImage: `
              radial-gradient(at 0% 0%, hsla(210, 100%, 94%, 1) 0px, transparent 50%),
              radial-gradient(at 100% 0%, hsla(190, 100%, 92%, 1) 0px, transparent 50%),
              radial-gradient(at 100% 100%, hsla(220, 100%, 95%, 1) 0px, transparent 50%),
              radial-gradient(at 0% 100%, hsla(250, 100%, 96%, 1) 0px, transparent 50%),
              radial-gradient(at 50% 50%, hsla(200, 100%, 93%, 1) 0px, transparent 50%)
            `
          }}
        >
          {/* Floating Top Bar Island */}
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 h-[120px] z-30"
          >
            {/* Wavy Header Background */}
            <div className="absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 1440 120" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="none">
                <path 
                  d="M 60,0 L 1380,0 A 60,60 0 0,1 1440,60 A 60,60 0 0,1 1380,120 L 1100,120 C 1020,120 1020,70 940,70 L 500,70 C 420,70 420,120 340,120 L 60,120 A 60,60 0 0,1 0,60 A 60,60 0 0,1 60,0 Z" 
                  fill="#ffffff" 
                />
              </svg>
            </div>

            {/* Top Bar Items */}
            <div className="relative w-full h-[120px] flex justify-between items-start px-4 sm:px-6">
              
              {/* Left Button Container (The Toggle) */}
              <div className="h-[120px] flex items-center">
                <div className="bg-slate-100/80 backdrop-blur-md rounded-full p-1.5 flex shadow-inner border border-slate-200">
                  <button 
                    onClick={() => setActiveView("teacher")}
                    className={`px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-bold transition ${activeView === "teacher" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    For Teachers
                  </button>
                  <button 
                    onClick={() => setActiveView("student")}
                    className={`px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-bold transition ${activeView === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    For Students
                  </button>
                </div>
              </div>

              {/* Middle Stats Container (Dynamic based on activeView) */}
              <div className="h-[70px] hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-6 xl:gap-10">
                <AnimatePresence mode="wait">
                  {activeView === "teacher" ? (
                    <motion.div key="stats-teacher" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-6 xl:gap-10">
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Users</span>
                          <span className="text-sm font-black text-slate-800">12,500+</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Papers Graded</span>
                          <span className="text-sm font-black text-slate-800">450,000+</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg. Grading Time</span>
                          <span className="text-sm font-black text-slate-800">1.2 Secs</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="stats-student" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-6 xl:gap-10">
                      <div className="flex items-center gap-3">
                        <Library size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enrolled Courses</span>
                          <span className="text-sm font-black text-slate-800">45+</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <BrainCircuit size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Instant Results</span>
                          <span className="text-sm font-black text-slate-800">100%</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                        <GraduationCap size={18} className="text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Score</span>
                          <span className="text-sm font-black text-slate-800">A- (92%)</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Button Container */}
              <div className="h-[120px] flex items-center">
                <Link to="/login" className="bg-slate-100 hover:bg-slate-200 transition rounded-full px-6 py-2.5 lg:px-7 lg:py-3 flex items-center gap-2 font-bold text-slate-900 text-sm shadow-sm border border-slate-200">
                  Login <ArrowUpRight size={16} className="text-slate-500" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Hero Text (Dynamic) */}
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 text-center w-full z-10 pointer-events-none">
            <AnimatePresence mode="wait">
              {activeView === "teacher" ? (
                <motion.h1 
                  key="hero-teacher"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                  className="text-6xl lg:text-8xl font-black tracking-tight leading-[1.1] text-black drop-shadow-2xl"
                  style={{ textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0px 2px 0 #fff, 2px 0px 0 #fff, 0px -2px 0 #fff, -2px 0px 0 #fff' }}
                >
                  Unified Digital <br /> University
                </motion.h1>
              ) : (
                <motion.h1 
                  key="hero-student"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                  className="text-6xl lg:text-8xl font-black tracking-tight leading-[1.1] text-black drop-shadow-2xl"
                  style={{ textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0px 2px 0 #fff, 2px 0px 0 #fff, 0px -2px 0 #fff, -2px 0px 0 #fff' }}
                >
                  Transparent <br /> Academic Results
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Hero Description (Dynamic Positioning) */}
          <div className={`absolute bottom-8 w-[320px] z-10 hidden md:block ${activeView === "teacher" ? "right-8" : "left-8"}`}>
            <AnimatePresence mode="wait">
              {activeView === "teacher" ? (
                <motion.p 
                  key="desc-teacher"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  className="text-slate-800 text-sm leading-relaxed font-semibold bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/50 text-right"
                >
                  A single platform for your academic journey. Empower your teaching with extraordinary AI models. Automate grading, minimize manual errors, and provide instantaneous feedback.
                </motion.p>
              ) : (
                <motion.p 
                  key="desc-student"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  className="text-slate-800 text-sm leading-relaxed font-semibold bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/50 text-left"
                >
                  Access your detailed results seamlessly. Track your academic progress, view paper-wise marks, and check transparent AI-generated feedback with our modern workflow.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Cards (Dynamic) */}
          <AnimatePresence>
            {activeView === "teacher" && (
              <motion.div 
                key="card-teacher"
                initial={{ y: 50, x: -50, opacity: 0 }}
                animate={{ y: 0, x: 0, opacity: 1 }}
                exit={{ y: 50, x: -50, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="absolute bottom-6 left-6 w-[420px] bg-white rounded-[2.5rem] p-8 shadow-2xl z-20"
              >
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">For Educators</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                  Empower your teaching with extraordinary AI models. Automate grading, minimize manual errors, and provide instantaneous feedback to your students with just a few clicks.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">75+</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Faculty</span>
                  </div>
                  <div className="flex -space-x-3 ml-4">
                    <img src="https://i.pravatar.cc/100?img=11" className="w-12 h-12 rounded-full border-[3px] border-white object-cover shadow-sm" alt="User 1" />
                    <img src="https://i.pravatar.cc/100?img=12" className="w-12 h-12 rounded-full border-[3px] border-white object-cover shadow-sm" alt="User 2" />
                    <img src="https://i.pravatar.cc/100?img=13" className="w-12 h-12 rounded-full border-[3px] border-white object-cover shadow-sm" alt="User 3" />
                  </div>
                  <Link to="/dashboard" className="ml-auto w-12 h-12 bg-slate-100 hover:bg-slate-200 transition rounded-full flex items-center justify-center text-slate-900 shadow-inner">
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </motion.div>
            )}

            {activeView === "student" && (
              <motion.div 
                key="card-student"
                initial={{ y: 50, x: 50, opacity: 0 }}
                animate={{ y: 0, x: 0, opacity: 1 }}
                exit={{ y: 50, x: 50, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="absolute bottom-6 right-6 w-[360px] bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 shadow-2xl border border-white/60 z-20"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 drop-shadow-sm mb-1 tracking-tight">For Students</h3>
                    <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold opacity-80">
                      <MapPin size={12} /> Access Transparent Results
                    </div>
                  </div>
                  <Link to="/results" className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:scale-105 transition-transform">
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                
                <p className="text-slate-800 text-xs font-bold leading-relaxed mb-6 mix-blend-color-burn">
                  Access your detailed results seamlessly. Our platform offers a modern workflow to track your academic progress, view paper-wise marks, and check transparent AI-generated feedback.
                </p>

                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-800 tracking-wide">
                    <span className="flex items-center gap-1.5"><LayoutGrid size={14} className="opacity-70"/> View Papers</span>
                    <span className="opacity-50">•</span>
                    <span className="flex items-center gap-1.5"><BrainCircuit size={14} className="opacity-70"/> Instant Results</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-950 rounded-full flex items-center justify-center text-white text-lg font-black shadow-xl shrink-0 tracking-tight">
                      100%
                    </div>
                    
                    <div className="ml-auto flex gap-2">
                      <button className="w-9 h-9 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full flex items-center justify-center text-slate-800 border border-white/50 shadow-sm">
                        <Heart size={16} />
                      </button>
                      <button className="w-9 h-9 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full flex items-center justify-center text-slate-800 border border-white/50 shadow-sm">
                        <Bookmark size={16} />
                      </button>
                      <button className="w-9 h-9 bg-white/60 hover:bg-white/80 transition backdrop-blur-xl rounded-full flex items-center justify-center text-slate-800 border border-white/50 shadow-sm">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
    </div>
  );
}

export default Dashboard;