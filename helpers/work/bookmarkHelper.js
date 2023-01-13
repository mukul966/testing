const { v4: uuidv4 } = require('uuid');
const db = require('../../routes/dbhelper');
var pool = db.getconnection();

const createBookmark = (squad_id, work_id) =>
	new Promise((resolve, reject) => {
		const bookmark_id = uuidv4();
		const query = 'INSERT INTO work_bookmark(bookmark_id,work_id,squad_id) VALUES(?,?,?)';

		pool.query(query, [bookmark_id, work_id, squad_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else
				resolve({
					message: 'bookmark created!',
					bookmark_id: bookmark_id
				});
		});
	})
		.then((rows) => {
			return rows;
		})
		.catch((error) => {
			return error;
		});

const getBookmarks = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM work_bookmark where squad_id=?';

		pool.query(query, squad_id, function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((rows) => {
			return { count: rows.length, bookmarks: rows };
		})
		.catch((error) => {
			return error;
		});

const deleteBookmark = (bookmark_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_bookmark WHERE bookmark_id = ?';
		pool.query(query, [bookmark_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then(() => {
			return { message: `bookmark deleted with id ${bookmark_id}`, success: true };
		})
		.catch((error) => {
			return error;
		});

const checkBookmark = (squad_id, work_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
			*
		FROM
			work_bookmark
		WHERE
			squad_id = ? AND work_id = ?`;

		pool.query(query, [squad_id, work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((rows) => {
			return { isBookmark: rows.length == 0 ? false : true };
		})
		.catch((error) => {
			return error;
		});

module.exports = {
	createBookmark,
	getBookmarks,
	deleteBookmark,
	checkBookmark
};
