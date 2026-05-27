export const parseAnswers = (
  extractedText
) => {

  const lines =
    extractedText.split("\n");

  let answers = [];

  let currentQNo = null;

  let currentAnswer = "";

  for (let line of lines) {

    line = line.trim();

    // Detect Question Number
    // Example:
    // Q1
    // 1.
    // 1)
    // Question 1

    const match =
      line.match(
        /^(Q\.?\s*)?(\d+[a-zA-Z]?)[\.\)\-:]?/i
      );

    if (match) {

      // SAVE PREVIOUS

      if (
        currentQNo &&
        currentAnswer
      ) {

        answers.push({

          questionNo:
            currentQNo,

          answer:
            currentAnswer.trim(),
        });
      }

      currentQNo =
        match[2];

      currentAnswer =
        line;

    } else {

      currentAnswer +=
        "\n" + line;
    }
  }

  // LAST ANSWER

  if (
    currentQNo &&
    currentAnswer
  ) {

    answers.push({

      questionNo:
        currentQNo,

      answer:
        currentAnswer.trim(),
    });
  }

  return answers;
};