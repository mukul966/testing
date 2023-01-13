const Resource = function(resource) {
    this.resource_id = resource.resource_id,
    this.work_id = resource.work_id,
    this.role_name = resource.organisation_id,
    this.currency = resource.currency,
    this.amount = resource.amount
};

module.exports = Resource;