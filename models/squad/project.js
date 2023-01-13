const Project = function(project) {
    this.project_id = project.project_id,
    this.squad_id = project.squad_id,
    this.logo_id = project.logo_id,
    this.name = project.name,
    this.category = project.category,
    this.description = project.description,
    this.project_status = project.project_status,
    this.percentage = project.percentage,
    this.candidature = project.candidature,
    this.skills = project.skills,
    this.currency = project.currency
    this.budget = project.budget,
    this.payment = project.payment,
    this.start_date = project.start_date,
    this.end_date = project.end_date
};

module.exports = Project;