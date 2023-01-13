const Interest = function (interest) {
    this.interest_id = interest.interest_id,
        this.user_id = interest.user_id,
        this.logo_id = interest.logo_id,
        this.name = interest.name,
        this.type = interest.type
};

module.exports = Interest;