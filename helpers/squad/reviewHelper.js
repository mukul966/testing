const { v4: uuidv4 } = require("uuid");
const Review = require("../../models/squad/review");
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createReview = (update) =>
	new Promise((resolve, reject) => {
		delete update.review_id;
		const review = new Review({
			review_id: uuidv4(),
			...update
		});

		const createReviewQuery = 'INSERT INTO squad_review SET ?';

		connection.query(createReviewQuery, review, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Review Created',
					review_id: review.review_id
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from createReview() :>> ', err);
			return {
				error: err.message
			};
		});

const updateReview = (update) =>
	new Promise((resolve, reject) => {
		const { review_id } = update;
		delete update.review_id;
		delete update.user_id;

		const updateReviewQuery =
			'UPDATE squad_review SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE review_id = ?';

		const parameters = [...Object.values(update), review_id];

		connection.query(updateReviewQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Review updated', review_id });
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

async function getReviews(squad_id) {
	try {
		const reviews = await getAllReviews(squad_id);
		let no_of_items = reviews.length;
		let filled = no_of_items > 0 ? true : false;

		let sum_rating = 0,
			avg_rating = 0,
			five_count = 0,
			four_count = 0,
			three_count = 0,
			two_count = 0,
			one_count = 0,
			rating_count = 0;

		//calculate ratings
		for (let i = 0; i < reviews.length; i++) {
			let iterator = reviews[i];

			if (iterator.rating === null) {
				continue;
			} else {
				rating_count++;
				sum_rating += iterator.rating;
			}

			if (iterator.rating == 5) {
				five_count++;
			} else if (iterator.rating >= 4 && iterator.rating < 5) {
				four_count++;
			} else if (iterator.rating >= 3 && iterator.rating < 4) {
				three_count++;
			} else if (iterator.rating >= 2 && iterator.rating < 3) {
				two_count++;
			} else if (iterator.rating >= 1 && iterator.rating < 2) {
				one_count++;
			}
		}

		avg_rating = sum_rating / rating_count;

		return {
			filled,
			no_of_items,
			all_rating: rating_count,
			avg_rating,
			five_count,
			four_count,
			three_count,
			two_count,
			one_count,
			review_list: reviews
		};
	} catch (error) {
		console.log('error from getReviews-fn :>> ', error);
		return error;
	}
}

const getAllReviews = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad_review WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			return {
				error: err.message
			};
		});

async function checkReview(squad_id) {
	const reviews = await getAllReviews(squad_id).then((response) => {
		return response;
	});
	let no_of_items = reviews.length;
	let filled = no_of_items > 0 ? true : false;
	return filled;
}

const deleteReview = (review_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_review WHERE review_id = ?`;
		connection.query(deleteQuery, review_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { review_id } = data;
		const reviews = await deleteReview(review_id).then((response) => {
			return response;
		});

		return { message: 'Review deleted.' };
	} catch (error) {
		console.log('error from removeOne-fn :>> ', error);
		return error;
	}
}

const deleteAllReviews = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_review WHERE squad_id = ?`;
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
				message: 'Review(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllReviews() :>> ', e);
			return { error: e.message };
		});

const getOneReview = (review_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_review WHERE review_id = ?`;
		connection.query(query, review_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from getOneReview() :>> ', err);
			return {
				error: err.message
			};
		});

module.exports = {
	createReview,
	updateReview,
	getReviews,
	checkReview,
	removeOne,
	deleteAllReviews,
	getOneReview
};
