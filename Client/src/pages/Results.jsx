import { useEffect,useState } from "react";
import axios from "axios";
import {Trophy,FileText,Sparkles,User,} from "lucide-react";

function Results() {

  const [results, setResults] =
    useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults =
    async () => {

      try {

        const res =
          await axios.get(
            "http://localhost:5001/api/evaluations"
          );

        setResults(res.data);

      } catch (error) {

        console.log(error);
      }
    };

  return (

    <div
      className="
      min-h-screen
      bg-gradient-to-br
      from-slate-950
      via-slate-900
      to-slate-950
      text-white
      p-10
      "
    >

      {/* Glow */}

      <div
        className="
        absolute
        top-0
        left-0
        w-96
        h-96
        bg-cyan-500/20
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

      <div
        className="
        relative
        z-10
        max-w-6xl
        mx-auto
        "
      >

        {/* Header */}

        <div className="mb-10">

          <div className="flex items-center gap-4">

            <div
              className="
              w-16
              h-16
              rounded-2xl
              bg-gradient-to-br
              from-cyan-500
              to-blue-600
              flex
              items-center
              justify-center
              shadow-lg
              shadow-cyan-500/30
              "
            >
              <Trophy size={32} />
            </div>

            <div>

              <h1
                className="
                text-5xl
                font-black
                "
              >
                Results Dashboard
              </h1>

              <p
                className="
                text-gray-400
                mt-2
                "
              >
                AI generated evaluation reports
              </p>

            </div>
          </div>
        </div>

        {/* Results */}

        <div className="space-y-8">

          {results.map((result) => (

            <div
              key={result._id}

              className="
              bg-white/5
              border
              border-white/10
              rounded-3xl
              backdrop-blur-xl
              p-8
              shadow-2xl
              "
            >

              {/* Top */}

              <div
                className="
                flex
                justify-between
                items-center
                mb-8
                "
              >

                <div>

                  <div
                    className="
                    flex
                    items-center
                    gap-3
                    "
                  >

                    <User
                      className="
                      text-cyan-400
                      "
                    />

                    <h2
                      className="
                      text-3xl
                      font-bold
                      "
                    >
                      {result.studentName}
                    </h2>

                  </div>

                  <p className="text-gray-400 mt-2">
                    Roll Number:
                    {" "}
                    {result.rollNumber}
                  </p>

                </div>

                <div
                  className="
                  bg-cyan-500/10
                  border
                  border-cyan-500/20
                  px-6
                  py-4
                  rounded-2xl
                  "
                >

                  <p className="text-gray-400 text-sm">
                    Total Marks
                  </p>

                  <h3
                    className="
                    text-4xl
                    font-black
                    text-cyan-400
                    "
                  >
                    {result.totalMarks} / {result.marks.reduce((sum, m) => sum + (Number(m.maxMarks) || 0), 0)}
                  </h3>

                </div>
              </div>

              {/* Questions */}

              <div className="space-y-5">

                {result.marks.map(
                  (m, index) => (

                    <div
                      key={index}

                      className="
                      bg-slate-900/60
                      border
                      border-white/10
                      rounded-2xl
                      p-6
                      "
                    >

                      <div
                        className="
                        flex
                        justify-between
                        items-center
                        mb-4
                        "
                      >

                        <div
                          className="
                          flex
                          items-center
                          gap-3
                          "
                        >

                          <FileText
                            className="
                            text-cyan-400
                            "
                          />

                          <h3
                            className="
                            text-2xl
                            font-bold
                            "
                          >
                            Question
                            {" "}
                            {m.questionNo}
                          </h3>

                        </div>

                        <div
                          className="
                          bg-green-500/10
                          border
                          border-green-500/20
                          px-5
                          py-2
                          rounded-xl
                          "
                        >

                          <p
                            className="
                            text-green-400
                            font-bold
                            "
                          >
                            {m.obtainedMarks} / {m.maxMarks}
                          </p>

                        </div>
                      </div>

                      <p className="text-gray-300 leading-7">
                        {m.feedback}
                      </p>

                    </div>
                  )
                )}
              </div>

              {/* Footer */}

              <div
                className="
                mt-8
                bg-purple-500/10
                border
                border-purple-500/20
                p-5
                rounded-2xl
                "
              >

                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >

                  <Sparkles
                    className="
                    text-purple-400
                    "
                  />

                  <p className="text-gray-300">
                    Evaluated in
                    {" "}
                    <span className="text-cyan-400 font-bold">
                      {result.checkingMode}
                    </span>
                    {" "}
                    mode using Grok AI.
                  </p>

                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Results;