const Squad = function (squad) {
    this.squad_id = squad.squad_id,
        this.squad_name = squad.squad_name,
        this.legal_name = squad.legal_name,
        this.order_array = squad.order,
        this.squad_completion = squad.squad_completion
};

module.exports = Squad;