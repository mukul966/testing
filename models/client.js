const Client = function(client) {
    this.client_id = client.client_id,
    this.squad_id = client.squad_id,
    this.image_id = client.image_id,
    this.client_name = client.client_name
};

module.exports = Client;