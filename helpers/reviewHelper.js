const { v4: uuidv4 } = require('uuid');
const Review = require('../models/review');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createReview = (update) =>
	new Promise((resolve, reject) => {
		delete update.review_id; //remove review_id:0
		const review = new Review({
			review_id: uuidv4(),
			...update
		});

		const createReviewQuery = 'INSERT INTO user_review SET ?';
		connection.query(createReviewQuery, review, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, review_id: review.review_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Review Created',
				review_id: res.review_id
			};
		})
		.catch((err) => {
			console.log('err from createReview() :>> ', err);
			return {
				error: err.message
			};
		});

const getOneReview = (review_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_review WHERE review_id = ?`;
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

const updateReview = (update) =>
	new Promise((resolve, reject) => {
		const { review_id } = update;
		delete update.review_id;

		const updateReviewQuery =
			'UPDATE user_review SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE review_id = ?';

		const parameters = [...Object.values(update), review_id];
		console.log('updateReviewDetails: Running Query:', updateReviewQuery, parameters);

		connection.query(updateReviewQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Review updated' });
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

async function getReviews(profile_id) {
	try {
		const reviews = await getAllReviews(profile_id);

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

const getAllReviews = (profile_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM user_review WHERE profile_id = ?';
		connection.query(query, profile_id, function (err, rows, fields) {
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

async function checkReview(profile_id) {
	const reviews = await getAllReviews(profile_id);

	let no_of_items = reviews.length;
	let filled = no_of_items > 0 ? true : false;
	return filled;
}

const deleteReview = (review_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_review WHERE review_id = ?`;
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
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createReview,
	updateReview,
	getReviews,
	checkReview,
	removeOne,
	getOneReview
};