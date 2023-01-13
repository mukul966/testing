const Review = function (review) {
    this.review_id = review.review_id,
    this.profile_id = review.profile_id,
    this.user_id = review.user_id, 
    this.rating = review.rating,
    this.comment = review.comment
};

module.exports = Review;