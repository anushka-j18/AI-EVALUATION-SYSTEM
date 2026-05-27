// src/pages/Dashboard.jsx

import { Link } from "react-router-dom";
import {
  FileText,
  Brain,
  BarChart3,
  Upload,
  CheckCircle,
  Users,
  Sparkles,
} from "lucide-react";

function Dashboard() {

  const cards = [

    {
      title: "Upload Question Paper",

      description:
        "Upload PDF/Image question papers with marks distribution.",

      icon: <Upload size={40} />,

      link: "/upload-question-paper",

      gradient:
        "from-blue-500 to-cyan-500",
    },

    {
      title: "AI Evaluation",

      description:
        "Evaluate scanned answer sheets using Grok AI.",

      icon: <Brain size={40} />,

      link: "/evaluate",

      gradient:
        "from-violet-500 to-purple-500",
    },

    {
      title: "Results & Analytics",

      description:
        "View question-wise marks and performance analytics.",

      icon: <BarChart3 size={40} />,

      link: "/results",

      gradient:
        "from-emerald-500 to-green-500",
    },
  ];

  return (

    <div
      className="
      min-h-screen
      bg-gradient-to-br
      from-slate-950
      via-slate-900
      to-slate-950
      text-white
      overflow-hidden
      "
    >

      {/* Background Glow */}

      <div
        className="
        absolute
        top-0
        left-0
        w-96
        h-96
        bg-blue-500/20
        blur-3xl
        rounded-full
        "
      />

      <div
        className="
        absolute
        bottom-0
        right-0
        w-96
        h-96
        bg-purple-500/20
        blur-3xl
        rounded-full
        "
      />

      {/* Navbar */}

      <div
        className="
        relative
        z-10
        flex
        justify-between
        items-center
        px-10
        py-6
        border-b
        border-white/10
        backdrop-blur-lg
        "
      >

        <div>

          <h1
            className="
            text-3xl
            font-extrabold
            tracking-wide
            flex
            items-center
            gap-3
            "
          >
            <Sparkles className="text-cyan-400" />

            AI Digital Evaluation
          </h1>

          <p className="text-gray-400 mt-1">
            Smart University Evaluation Platform
          </p>

        </div>

        <div
          className="
          bg-white/10
          px-5
          py-2
          rounded-full
          border
          border-white/10
          "
        >
          <p className="text-sm">
            Grok AI Powered
          </p>
        </div>
      </div>

      {/* Hero Section */}

      <div
        className="
        relative
        z-10
        px-10
        py-16
        "
      >

        <div className="max-w-4xl">

          <h2
            className="
            text-6xl
            font-black
            leading-tight
            "
          >
            Next Generation
            <span
              className="
              bg-gradient-to-r
              from-cyan-400
              to-blue-500
              bg-clip-text
              text-transparent
              "
            >
              {" "}
              AI Evaluation
            </span>
          </h2>

          <p
            className="
            text-gray-400
            text-lg
            mt-6
            max-w-2xl
            "
          >
            Upload question papers,
            evaluate answer sheets using AI,
            generate analytics and automate
            university examination workflows.
          </p>

          <div className="flex gap-5 mt-8">

            <Link
              to="/evaluate"

              className="
              px-8
              py-4
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              hover:scale-105
              transition
              shadow-lg
              shadow-cyan-500/30
              font-semibold
              "
            >
              Start Evaluation
            </Link>

            <Link
              to="/upload-question-paper"

              className="
              px-8
              py-4
              rounded-xl
              border
              border-white/20
              hover:bg-white/10
              transition
              "
            >
              Upload Question Paper
            </Link>
            <Link
            to="/view-question-papers"

            className="
            flex
            items-center
            gap-4
            bg-white/5
            hover:bg-white/10
            px-5
            py-4
            rounded-2xl
            transition
            "
          >

            <FileText
              size={22}
            />

            View Question Papers

          </Link>
          </div>

        </div>
      </div>

      {/* Feature Cards */}

      <div
        className="
        relative
        z-10
        px-10
        pb-16
        "
      >

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-8
          "
        >

          {cards.map((card, index) => (

            <Link
              to={card.link}

              key={index}
            >

              <div
                className="
                relative
                overflow-hidden
                rounded-3xl
                bg-white/5
                border
                border-white/10
                backdrop-blur-xl
                p-8
                h-full
                hover:scale-105
                hover:border-cyan-400/40
                transition-all
                duration-300
                shadow-2xl
                "
              >

                {/* Gradient Glow */}

                <div
                  className={`
                  absolute
                  inset-0
                  opacity-10
                  bg-gradient-to-br
                  ${card.gradient}
                  `}
                />

                <div
                  className={`
                  w-16
                  h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  bg-gradient-to-br
                  ${card.gradient}
                  shadow-lg
                  mb-6
                  `}
                >
                  {card.icon}
                </div>

                <h3
                  className="
                  text-2xl
                  font-bold
                  mb-4
                  "
                >
                  {card.title}
                </h3>

                <p className="text-gray-400">
                  {card.description}
                </p>

              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}

      <div
        className="
        relative
        z-10
        px-10
        pb-20
        "
      >

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-6
          "
        >

          <div
            className="
            bg-white/5
            border
            border-white/10
            rounded-2xl
            p-6
            backdrop-blur-xl
            "
          >

            <div className="flex items-center gap-3">

              <FileText className="text-cyan-400" />

              <p className="text-gray-400">
                Papers Uploaded
              </p>

            </div>

            <h3 className="text-4xl font-bold mt-4">
              250+
            </h3>

          </div>

          <div
            className="
            bg-white/5
            border
            border-white/10
            rounded-2xl
            p-6
            backdrop-blur-xl
            "
          >

            <div className="flex items-center gap-3">

              <CheckCircle className="text-green-400" />

              <p className="text-gray-400">
                Evaluations
              </p>

            </div>

            <h3 className="text-4xl font-bold mt-4">
              1.2K+
            </h3>

          </div>

          <div
            className="
            bg-white/5
            border
            border-white/10
            rounded-2xl
            p-6
            backdrop-blur-xl
            "
          >

            <div className="flex items-center gap-3">

              <Brain className="text-purple-400" />

              <p className="text-gray-400">
                AI Accuracy
              </p>

            </div>

            <h3 className="text-4xl font-bold mt-4">
              96%
            </h3>

          </div>

          <div
            className="
            bg-white/5
            border
            border-white/10
            rounded-2xl
            p-6
            backdrop-blur-xl
            "
          >

            <div className="flex items-center gap-3">

              <Users className="text-orange-400" />

              <p className="text-gray-400">
                Active Faculty
              </p>

            </div>

            <h3 className="text-4xl font-bold mt-4">
              75+
            </h3>

          </div>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;