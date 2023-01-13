const { v4: uuidv4 } = require("uuid");
const Project = require("../../models/squad/project");
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createProject = (update) =>
	new Promise((resolve, reject) => {
		delete update.project_id; //remove project_id:0
		const project = new Project({
			project_id: uuidv4(),
			...update
		});

		const createProjectQuery = 'INSERT INTO squad_project SET ?';
		connection.query(createProjectQuery, project, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, project_id: project.project_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Project Created',
				project_id: res.project_id
			};
		})
		.catch((err) => {
			console.log('err from createProject() :>> ', err);
			return {
				error: err.message
			};
		});

const getOneProject = (project_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_project WHERE project_id = ?`;
		connection.query(query, project_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((project) => {
			//hotfix
			if (project.skills !== null) {
				let skillsValue = project.skills.split(',')
				project.skills = skillsValue
			} else {
				project.skills = []
			}
			return project
		})
		.catch((err) => {
			console.log('err from getOneProject() :>> ', err);
			return {
				error: err.message
			};
		});

const updateProject = (update) =>
	new Promise((resolve, reject) => {
		const { project_id } = update;
		delete update.project_id;
		delete update.user_id;

		const updateProjectQuery =
			'UPDATE squad_project SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE project_id = ?';

		const parameters = [...Object.values(update), project_id];
		connection.query(updateProjectQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Project updated' });
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			return {
				error: err.message
			};
		});

const getProjects = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_project WHERE squad_id = ?`;
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((projects) => {
			let no_of_items = projects.length;
			let filled = no_of_items > 0 ? true : false;

			let completed = 0,
				ongoing = 0,
				in_line = 0;

			for (let i = 0; i < projects.length; i++) {
				let iterator = projects[i];
				if (iterator.project_status === 'completed') {
					completed++;
				} else if (iterator.project_status === 'ongoing') {
					ongoing++;
				} else {
					in_line++;
				}

				//hotfix
				if (iterator.skills !== null) {
					let skillsValue = iterator.skills.split(',')
					iterator.skills = skillsValue
				} else {
					iterator.skills = []
				}
			}

			return {
				filled,
				completed,
				ongoing,
				in_line,
				no_of_items,
				project_list: projects
			};
		})
		.catch((err) => {
			console.log('err from getAllProjects() :>> ', err);
			return { error: err.message };
		});

const deleteProject = ({ project_id }) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_project WHERE project_id = ?`;
		connection.query(deleteQuery, project_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: "Project deleted",
					success: true
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((e) => {
			console.log('err from deleteProject() :>> ', e);
			return { error: e.message };
		});

const deleteAllProjects = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_project WHERE squad_id = ?`;
		connection.query(deleteQuery, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return {
				message: 'Project(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllProjects() :>> ', e);
			return { error: e.message };
		});

module.exports = {
	createProject,
	updateProject,
	getProjects,
	deleteProject,
	deleteAllProjects,
	getOneProject
};
