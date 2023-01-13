const Service = function(service){
    this.service_id = service.service_id,
    this.squad_id = service.squad_id,
    this.info = service.info,
    this.logo_id = service.logo_id,
    this.service_name = service.service_name,
    this.software = service.software,
    this.primary_service = service.primary_service
};

module.exports = Service;