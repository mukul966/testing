const Question = function(question) {
    this.question_id = question.question_id,
    this.work_id = question.work_id,
    this.question = question.question,
    this.answer = question.answer
};

module.exports = Question;