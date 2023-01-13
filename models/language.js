const Language = function (language) {
    this.language_id = language.language_id,
    this.user_id = language.user_id, 
    this.language = language.language,
    this.medium = language.medium,
    this.level = language.level
};

module.exports = Language;