// src/components/DetectedQuestionsEditor.jsx

import { useEffect, useState } from "react";

import axios from "axios";

import {
  ClipboardList,
  Trash2,
  PlusCircle,
  Save,
  Loader2,
} from "lucide-react";

function DetectedQuestionsEditor({

  paperId,
}) {

  // ============================
  // STATES
  // ============================

  const [
    questions,
    setQuestions
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    saving,
    setSaving
  ] = useState(false);


  // ============================
  // FETCH QUESTIONS
  // ============================

  const fetchQuestions =
    async () => {

      try {

        setLoading(true);

        const res =
          await axios.get(

            `http://localhost:5001/api/questions/paper/${paperId}`
          );

        setQuestions(
          res.data.questions || []
        );

      } catch (error) {

        console.log(error);

        alert(
          "Failed to fetch questions"
        );

      } finally {

        setLoading(false);
      }
    };


  // ============================
  // LOAD DATA
  // ============================

  useEffect(() => {

    if (paperId) {

      fetchQuestions();
    }

  }, [paperId]);


  // ============================
  // HANDLE CHANGE
  // ============================

  const handleQuestionChange = (
    index,
    field,
    value
  ) => {

    const updated =
      [...questions];

    updated[index][field] =
      value;

    setQuestions(updated);
  };


  // ============================
  // ADD QUESTION
  // ============================

  const addQuestion = () => {

    setQuestions([

      ...questions,

      {
        qNo:
          `${questions.length + 1}`,

        question: "",

        maxMarks: 0,
      },
    ]);
  };


  // ============================
  // DELETE QUESTION
  // ============================

  const deleteQuestion =
    async (
      questionId,
      index
    ) => {

      try {

        // existing saved question

        if (questionId) {

          await axios.delete(

            `http://localhost:5001/api/questions/${questionId}`
          );
        }

        const updated =
          questions.filter(
            (_, i) =>
              i !== index
          );

        setQuestions(updated);

      } catch (error) {

        console.log(error);

        alert(
          "Delete failed"
        );
      }
    };


  // ============================
  // SAVE ALL QUESTIONS
  // ============================

  const saveQuestions =
    async () => {

      try {

        setSaving(true);

        await axios.put(

          `http://localhost:5001/api/questions/update-all/${paperId}`,

          {
            questions,
          }
        );

        alert(
          "Questions Updated Successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Failed to save questions"
        );

      } finally {

        setSaving(false);
      }
    };


  // ============================
  // LOADING
  // ============================

  if (loading) {

    return (

      <div
        className="
        flex
        justify-center
        items-center
        py-20
        text-cyan-400
        "
      >

        <Loader2
          className="
          animate-spin
          "
          size={40}
        />

      </div>
    );
  }


  return (

    <div
      className="
      mt-10
      bg-white/5
      border
      border-white/10
      rounded-[32px]
      backdrop-blur-xl
      p-8
      shadow-2xl
      "
    >

      {/* HEADER */}

      <div
        className="
        flex
        items-center
        justify-between
        flex-wrap
        gap-5
        mb-10
        "
      >

        <div
          className="
          flex
          items-center
          gap-4
          "
        >

          <div
            className="
            w-16
            h-16
            rounded-2xl
            bg-green-500/20
            flex
            items-center
            justify-center
            "
          >

            <ClipboardList
              className="
              text-green-400
              "
              size={30}
            />

          </div>

          <div>

            <h2
              className="
              text-4xl
              font-black
              text-white
              "
            >
              Question Editor
            </h2>

            <p
              className="
              text-gray-400
              mt-2
              "
            >
              Edit extracted questions
            </p>
          </div>
        </div>


        {/* SAVE */}

        <button

          onClick={saveQuestions}

          disabled={saving}

          className="
          flex
          items-center
          gap-2
          bg-cyan-500
          hover:bg-cyan-400
          px-6
          py-3
          rounded-2xl
          font-bold
          transition
          disabled:opacity-50
          "
        >

          {saving ? (

            <Loader2
              className="
              animate-spin
              "
              size={18}
            />

          ) : (

            <Save size={18} />
          )}

          Save Questions
        </button>
      </div>


      {/* EMPTY */}

      {questions.length === 0 && (

        <div
          className="
          text-center
          py-20
          "
        >

          <h3
            className="
            text-2xl
            font-bold
            text-gray-300
            "
          >
            No Questions Found
          </h3>

        </div>
      )}


      {/* QUESTIONS */}

      <div className="space-y-6">

        {questions.map(
          (q, index) => (

            <div
              key={q._id || index}

              className="
              bg-slate-900/60
              border
              border-white/10
              rounded-3xl
              p-6
              "
            >

              {/* TOP */}

              <div
                className="
                grid
                md:grid-cols-3
                gap-5
                mb-5
                "
              >

                {/* QNO */}

                <div>

                  <label
                    className="
                    text-sm
                    text-gray-400
                    "
                  >
                    Question No
                  </label>

                  <input
                    type="text"

                    value={
                      q.qNo || ""
                    }

                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "qNo",
                        e.target.value
                      )
                    }

                    className="
                    w-full
                    mt-2
                    bg-slate-800
                    border
                    border-white/10
                    rounded-2xl
                    p-4
                    text-white
                    "
                  />
                </div>


                {/* MARKS */}

                <div>

                  <label
                    className="
                    text-sm
                    text-gray-400
                    "
                  >
                    Max Marks
                  </label>

                  <input
                    type="number"

                    value={
                      q.maxMarks || 0
                    }

                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "maxMarks",
                        e.target.value
                      )
                    }

                    className="
                    w-full
                    mt-2
                    bg-slate-800
                    border
                    border-white/10
                    rounded-2xl
                    p-4
                    text-white
                    "
                  />
                </div>


                {/* DELETE */}

                <div
                  className="
                  flex
                  items-end
                  "
                >

                  <button

                    onClick={() =>
                      deleteQuestion(
                        q._id,
                        index
                      )
                    }

                    className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-red-500/20
                    border
                    border-red-500/30
                    text-red-400
                    py-4
                    rounded-2xl
                    font-bold
                    "
                  >

                    <Trash2 size={18} />

                    Delete
                  </button>
                </div>
              </div>


              {/* QUESTION */}

              <textarea

                rows={5}

                value={
                  q.question || ""
                }

                onChange={(e) =>
                  handleQuestionChange(
                    index,
                    "question",
                    e.target.value
                  )
                }

                className="
                w-full
                bg-slate-800
                border
                border-white/10
                rounded-2xl
                p-5
                text-white
                resize-none
                leading-7
                "
              />
            </div>
          )
        )}


        {/* ADD */}

        <button

          onClick={addQuestion}

          className="
          w-full
          py-5
          rounded-3xl
          border-2
          border-dashed
          border-cyan-500/30
          text-cyan-400
          font-bold
          text-lg
          hover:bg-cyan-500/10
          transition
          flex
          items-center
          justify-center
          gap-3
          "
        >

          <PlusCircle size={22} />

          Add Question
        </button>
      </div>
    </div>
  );
}

export default DetectedQuestionsEditor;