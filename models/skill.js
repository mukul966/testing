const Skill = function (skill) {
    this.skill_id = skill.skill_id,
    this.user_id = skill.user_id, 
    this.logo_id = skill.logo_id, 
    this.name = skill.name,
    this.description = skill.description,
    this.proficiency = skill.proficiency,
    this.duration = skill.duration
};

module.exports = Skill