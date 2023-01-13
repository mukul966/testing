const Client = function (client) {
    this.client_id = client.client_id,
        this.squad_id = client.squad_id,
        this.imgid = client.imgid,
        this.client_name = client.client_name
};

module.exports = Client;