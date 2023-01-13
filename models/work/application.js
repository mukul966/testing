const Application = function (data) {
    this.application_id = data.application_id,
        this.work_id = data.work_id,
        this.squad_id = data.squad_id,
        this.application_status = data.application_status,
        this.complete = data.complete
};

module.exports = Application;