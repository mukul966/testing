const License = function (license) {
    this.license_id = license.license_id,
    this.user_id = license.user_id, 
    this.logo_id = license.logo_id,
    this.name = license.name,
    this.license_number = license.license_number,
    this.issuing_authority = license.issuing_authority,
    this.description = license.description,
    this.start_date = license.start_date,
    this.end_date = license.end_date
};

module.exports = License;