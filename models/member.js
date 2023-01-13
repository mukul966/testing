const Member = function(member) {
  this.member_id = member.member_id,
  this.squad_id = member.squad_id,
  this.user_id = member.user_id
  this.member_role = member.member_role,
  this.image_id = member.image_id
};

module.exports = Member;