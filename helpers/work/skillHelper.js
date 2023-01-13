const { v4: uuidv4 } = require('uuid');
const db = require("../../routes/dbhelper");
var connection = db.getconnection();

const createSkillBulk = (skillData, work_id) =>
	new Promise((resolve, reject) => {
		const createSkillQuery = 'INSERT INTO work_skill (skill_id, work_id, skill_name) VALUES ?';

		connection.query(
			createSkillQuery,
			[skillData.map((e) => [uuidv4(), work_id, e])],
			function (err, rows, fields) {
				if (err) {
					reject({
						success: false,
						error: err.message
					});
				} else {
					resolve({
						success: true,
						message: 'Skill(s) Created'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createSkillBulk() :>> ', error);
			return {
				error: error.message
			};
		});

const getAllSkills = (work_id) =>
	new Promise((resolve, reject) => {
		const getAllSkillsQuery = 'SELECT skill_name FROM work_skill WHERE work_id = ?';
		connection.query(getAllSkillsQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let data = response.map(e => e.skill_name);
			return data;
		})
		.catch((error) => {
			console.log('error from getAllSkills() :>> ', error);
			return {
				error: error.message
			};
		});

const deleteSkill = (skillData) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM work_skill WHERE skill_id = ?`;
		connection.query(deleteQuery, skillData.skill_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Skill deleted'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from deleteSkill() :>> ', error);
			return {
				error: error.message
			};
		});

const updateSkill = (skillData) =>
	new Promise((resolve, reject) => {
		const { skill_id } = skillData;
		delete skillData.skill_id;

		const updateSkillQuery =
			'UPDATE work_skill SET ' +
			Object.keys(skillData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE skill_id = ?';

		const parameters = [...Object.values(skillData), skill_id];
		console.log('updateSkillDetails: Running Query:', updateSkillQuery, parameters);

		connection.query(updateSkillQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Skill updated.',
					skill_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from updateSkill() :>> ', error);
			return {
				error: error.message
			};
		});

const deleteSkillByWork_id = (work_id) =>
  new Promise((resolve, reject) => {
    const deleteQuery = `DELETE FROM work_skill WHERE work_id = ?`;
    connection.query(deleteQuery, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve({
          success: true,
          message: "Skill deleted",
        });
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("error from deleteSkillByWork_id() :>> ", error);
      return {
        error: error.message,
      };
    });



module.exports = {
	createSkillBulk,
	getAllSkills,
	deleteSkill,
	updateSkill,
      deleteSkillByWork_id
};
