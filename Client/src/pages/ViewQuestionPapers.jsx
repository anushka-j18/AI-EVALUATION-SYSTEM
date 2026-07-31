/* eslint-disable react-hooks/set-state-in-effect */
import {
  useEffect,
  useState,
} from "react";
import api, { SERVER_URL } from "../api/axiosConfig";
import { Link } from "react-router-dom";

import {
  FileText,
  Download,
  Eye,
  CalendarDays,
  BookOpen,
  Hash,
  Code2,
  Search,
} from "lucide-react";

function ViewQuestionPapers() {

  const [papers, setPapers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");


  // ============================
  // FETCH PAPERS
  // ============================

  const fetchPapers =
    async () => {

      try {

        const res =
          await api.get(

            "/question-papers"
          );

        setPapers(
          res.data.papers || []
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    fetchPapers();

  }, []);


  // ============================
  // FILTER
  // ============================

  const filteredPapers =
    papers.filter((paper) =>

      paper.subject
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      paper.subjectCode
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  return (

    <div
      className="
      min-h-screen
      bg-[#020617]
      text-white
      relative
      overflow-hidden
      "
    >

      {/* BACKGROUND */}

      <div
        className="
        absolute
        top-0
        left-0
        w-[400px]
        h-[400px]
        bg-cyan-500/10
        blur-3xl
        rounded-full
        "
      />

      <div
        className="
        absolute
        bottom-0
        right-0
        w-[400px]
        h-[400px]
        bg-blue-500/10
        blur-3xl
        rounded-full
        "
      />

      {/* MAIN */}

      <div
        className="
        relative
        z-10
        max-w-7xl
        mx-auto
        px-6
        py-12
        "
      >

        {/* HEADER */}

        <div
          className="
          flex
          flex-col
          md:flex-row
          justify-between
          items-center
          gap-5
          mb-10
          "
        >

          <div>

            <h1
              className="
              text-5xl
              font-black
              "
            >
              Uploaded Question Papers
            </h1>

            <p
              className="
              text-gray-400
              mt-2
              "
            >
              AI Digital Evaluation System
            </p>

          </div>


          {/* SEARCH */}

          <div
            className="
            relative
            w-full
            md:w-[350px]
            "
          >

            <Search
              size={18}
              className="
              absolute
              top-4
              left-4
              text-gray-400
              "
            />

            <input
              type="text"

              placeholder="Search subject/code"

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              className="
              w-full
              bg-slate-900/70
              border
              border-white/10
              rounded-2xl
              py-4
              pl-12
              pr-4
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-500
              "
            />
          </div>
        </div>


        {/* LOADING */}

        {loading ? (

          <div
            className="
            text-center
            py-20
            text-2xl
            font-bold
            "
          >
            Loading...
          </div>

        ) : filteredPapers.length === 0 ? (

          <div
            className="
            text-center
            py-20
            "
          >

            <FileText
              size={70}
              className="
              mx-auto
              text-gray-500
              mb-5
              "
            />

            <h2
              className="
              text-3xl
              font-bold
              "
            >
              No Question Papers Found
            </h2>

          </div>

        ) : (

          <div
            className="
            grid
            md:grid-cols-2
            xl:grid-cols-3
            gap-8
            "
          >

            {filteredPapers.map(
              (paper) => (

                <div
                  key={paper._id}

                  className="
                  bg-white/5
                  border
                  border-white/10
                  rounded-3xl
                  p-6
                  backdrop-blur-xl
                  hover:border-cyan-500/40
                  transition-all
                  shadow-xl
                  "
                >

                  {/* TOP */}

                  <div
                    className="
                    flex
                    justify-between
                    items-start
                    mb-6
                    "
                  >

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
                      "
                    >

                      <FileText
                        size={30}
                      />

                    </div>

                    <div
                      className="
                      bg-cyan-500/10
                      text-cyan-400
                      px-4
                      py-2
                      rounded-xl
                      text-sm
                      font-semibold
                      "
                    >
                      {paper.examName}
                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="space-y-4">

                    <div>

                      <p
                        className="
                        text-gray-400
                        text-sm
                        mb-1
                        "
                      >
                        Subject
                      </p>

                      <h2
                        className="
                        text-2xl
                        font-bold
                        "
                      >
                        {paper.subject}
                      </h2>

                    </div>


                    <div
                      className="
                      flex
                      items-center
                      gap-3
                      text-gray-300
                      "
                    >

                      <Code2 size={18} />

                      {paper.subjectCode}

                    </div>


                    <div
                      className="
                      flex
                      items-center
                      gap-3
                      text-gray-300
                      "
                    >

                      <CalendarDays
                        size={18}
                      />

                      {paper.session}

                    </div>


                    <div
                      className="
                      flex
                      items-center
                      gap-3
                      text-gray-300
                      "
                    >

                      <Hash size={18} />

                      {paper.totalMarks}
                      {" "}
                      Marks

                    </div>

                  </div>


                  {/* BUTTONS */}

                  <div
                    className="
                    grid
                    grid-cols-1
                    gap-4
                    mt-8
                    "
                  >

                    {/* VIEW */}

                    <a
                      href={`${SERVER_URL}/${paper.fileUrl}`}

                      target="_blank"

                      rel="noreferrer"

                      className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-cyan-500
                      hover:bg-cyan-600
                      py-3
                      rounded-2xl
                      font-semibold
                      transition
                      "
                    >

                      <Eye size={18} />

                      View Paper

                    </a>


                    


                    {/* EDIT QUESTIONS */}

                    <Link

                      to={`/question-editor/${paper._id}`}

                      className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-green-500
                      hover:bg-green-600
                      py-3
                      rounded-2xl
                      font-semibold
                      transition
                      "
                    >

                      <BookOpen
                        size={18}
                      />

                      Edit Questions

                    </Link>

                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewQuestionPapers;