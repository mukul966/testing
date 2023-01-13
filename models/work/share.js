const Share = function (data) {
    this.share_id = data.share_id,
        this.work_id = data.work_id,
        this.squad_id = data.squad_id,
        this.work_request_status = data.work_request_status
};

module.exports = Share;