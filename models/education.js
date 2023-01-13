const Education = function (education) {
    this.education_id = education.education_id,
    this.user_id = education.user_id, 
    this.logo_id = education.logo_id,
    this.name = education.name,
    this.course = education.course,
    this.field = education.field,
    this.description = education.description,
    this.start_date = education.start_date,
    this.end_date = education.end_date
};

module.exports = Education;