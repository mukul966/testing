const { v4: uuidv4 } = require('uuid');
const Project = require('../models/project');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createProject = (update) =>
	new Promise((resolve, reject) => {
		delete update.project_id; //remove project_id:0
		const project = new Project({
			project_id: uuidv4(),
			...update
		});

		const createProjectQuery = 'INSERT INTO user_project SET ?';
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

const updateProject = (update) =>
	new Promise((resolve, reject) => {
		const { project_id } = update;
		delete update.project_id;
		delete update.user_id

		const updateProjectQuery =
			'UPDATE user_project SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE project_id = ?';

		const parameters = [...Object.values(update), project_id];
		console.log('updateProjectDetails: Running Query:', updateProjectQuery, parameters);

		connection.query(updateProjectQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { message: 'Project updated' };
		})
		.catch((err) => {
			return {
				error: err.message
			};
		});

const getOneProject = (project_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_project WHERE project_id = ?`;
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

const getProjects = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_project WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
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

const deleteProject = (project_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_project WHERE project_id = ?`;
		connection.query(deleteQuery, project_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { project_id } = data;
		const projects = await deleteProject(project_id).then((response) => {
			return response;
		});

		return { message: 'Project deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createProject,
	getProjects,
	updateProject,
	removeOne,
	getOneProject
};