const Visa = function (visa) {
    this.visa_id = visa.visa_id,
        this.user_id = visa.user_id,
        this.logo_id = visa.logo_id,
        this.name = visa.name,
        this.credential_id = visa.credential_id,
        this.issuing_authority = visa.issuing_authority,
        this.type = visa.type,
        this.start_date = visa.start_date,
        this.end_date = visa.end_date
};

module.exports = Visa;