const Profile = function (profile) {
	this.profile_id = profile.profile_id,
		this.user_id = profile.user_id,
		this.order_array = profile.order_array,
		this.followers = profile.followers,
		this.projects = profile.projects,
		this.squads = profile.squads,
		this.default_currency = profile.currency,
		this.profile_completion = profile.profile_completion
};

module.exports = Profile;
