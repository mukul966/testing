const { options } = require('@hapi/joi/lib/base');
const { cookie } = require('request');
const { v4: uuidv4 } = require('uuid');
const db = require('../../routes/dbhelper');
var pool = db.getconnection();

//[TODO][IDEA]: single function handles both question. 1.objective 2.subjective
//function maps 2arrays. and handles them both
const createQuestionnaireBulk = (questionData, work_id) =>
	new Promise((resolve, reject) => {
		const createQuestionQuery = `INSERT INTO work_questionnaire(questionnaire_id, work_id, question, type, options) VALUES ?`;
		pool.query(
			createQuestionQuery,
			[
				questionData.map((e) => [
					uuidv4(),
					work_id,
					e.question,
					e.type,
					e.type === 'objective' ? e.options.join() : null
				])
			],
			function (err, rows, fields) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve({
						message: 'Questionnaire created'
					});
				}
			}
		);
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from createQuestionnaireBulk() :>> ', err);
			return {
				error: err.message
			};
		});

const createAnswers = (questionData, application_id) =>
	new Promise((resolve, reject) => {
		const query = `INSERT INTO work_application_answer(answer_id, application_id, questionnaire_id, type_answer, answer) VALUES ?`;

		pool.query(
			query,
			[questionData.map((e) => [uuidv4(), application_id, e.questionnaire_id, e.type_answer, e.answer])],
			function (err, rows, fields) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve({
						success_create_answers: true,
						message: 'Answers created'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createAnswers() :>> ', error);
			return { error: error.message };
		});

const getAllQuestionnaire = (work_id) =>
	new Promise((resolve, reject) => {
		const getAllQuestionnaireQuery =
			'SELECT questionnaire_id, question, type, options FROM work_questionnaire WHERE work_id = ?';
		pool.query(getAllQuestionnaireQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response === undefined || response === null || response === []) {
				return [];
			}

			response.forEach((e) => {
				if (e.type === 'objective') {
					let aux = e.options.split(',');
					e.options = aux;
				}
			});

			return response;
		})
		.catch((error) => {
			console.log('error from getAllQuestionnaire():>> ', error);
			return { error: error.message };
		});

const deleteQuestionnaire = (questionnaireData) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM work_questionnaire WHERE questionnaire_id = ?`;
		pool.query(deleteQuery, questionnaireData.questionnaire_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Questionnaire deleted'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from deleteQuestionnaire() :>> ', error);
			return {
				error: error.message
			};
		});

const updateQuestionnaire = (questionnaireData) =>
	new Promise((resolve, reject) => {
		const { questionnaire_id } = questionnaireData;
		delete questionnaireData.questionnaire_id;

		const updateQuestionnaireQuery =
			'UPDATE work_questionnaire SET ' +
			Object.keys(questionnaireData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE questionnaire_id = ?';

		const parameters = [...Object.values(questionnaireData), questionnaire_id];
		console.log('updateQuestionnaireDetails: Running Query:', updateQuestionnaireQuery, parameters);

		pool.query(updateQuestionnaireQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Questionnaire updated.',
					questionnaire_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from updateQuestionnaire():>> ', error);
			console.log('error :>> ', error);
			return {
				error: error.message
			};
		});

// [TODO][WIP] review this fn again.
const getAllQuestionAnswer = (work_id) =>
	new Promise((resolve, reject) => {
		const getAllQuestionnaireQuery = `SELECT 
		work_application_answer.answer_id,
		work_application_answer.answer,
		work_application_answer.type_answer,
		work_application_answer.questionnaire_id
	FROM
		work_application_answer
	WHERE
		application_id = ?`;

		pool.query(getAllQuestionnaireQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response === undefined || response === null || response === []) {
				return [];
			}

			response.forEach((e) => {
				if (e.type === 'objective') {
					let aux = e.options.split(',');
					e.options = aux;
				}
			});

			return response;
		})
		.catch((error) => {
			console.log('error from getAllQuestionAnswer():>> ', error);
			return { error: error.message };
		});

const mergeQuestionandAnswers = (questionnaire, answers) => {
	const myMap = new Map();
	for (let i = 0; i < answers.length; i++) {
		myMap.set(answers[i].questionnaire_id, `${answers[i].answer}`);
	}

	for (let j = 0; j < questionnaire.length; j++) {
		let value = myMap.get(questionnaire[j].questionnaire_id);
		questionnaire[j].answer = value;
	}

	// delete answers;
	return questionnaire;
};

const deleteQuestionnaireByWork_id = (work_id) =>
  new Promise((resolve, reject) => {
    const deleteQuery = `DELETE FROM work_questionnaire WHERE work_id= ?`;
    pool.query(deleteQuery, work_id,
      function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve({
            success: true,
            message: "Questionnaire deleted",
          });
        }
      }
    );
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("error from deleteQuestionnaire() :>> ", error);
      return {
        error: error.message,
      };
    });

module.exports = {
	createQuestionnaireBulk,
	createAnswers,
	getAllQuestionnaire,
	deleteQuestionnaire,
	updateQuestionnaire,
	getAllQuestionAnswer,
	mergeQuestionandAnswers,
      deleteQuestionnaireByWork_id
};
