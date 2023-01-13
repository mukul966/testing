const Experience = function (experience) {
    this.experience_id = experience.experience_id,
    this.user_id = experience.user_id, 
    this.logo_id = experience.logo_id, 
    this.name = experience.name,
    this.post = experience.post,
    this.employment_type = experience.employment_type,
    this.description = experience.description,
    this.start_date = experience.start_date,
    this.end_date = experience.end_date
};

module.exports = Experience;