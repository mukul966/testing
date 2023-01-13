const Alliance = function(alliance) {
    this.alliance_id = alliance.alliance_id,
    this.squad_id = alliance.squad_id,
    this.logo_id = alliance.logo_id,
    this.partner_name = alliance.partner_name,
    this.partnership_id = alliance.partnership_id,
    this.description = alliance.description,
    this.start_date = alliance.start_date,
    this.end_date = alliance.end_date
};

module.exports = Alliance;