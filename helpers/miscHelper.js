async function addFilledField(general) {
	//[BUG] adds filled:true for general.linked_accounts when all fields are null. Fix later
	if (general.length === 0) {
		general.filled = false;
		return general;
	}
	for (let prop in general) {
		let iterator = general[prop];
		let flag = false;
		for (key in iterator) {
			if (iterator[key] !== null) {
				if (Array.isArray(iterator[key])) {
					flag = iterator[key].length > 0 ? true : false;	//edge case when empty array turns filled to true, this sets filled to false when empty array. Ex:- core_values: []
					break;
				}
				flag = true;
				break;
			}
		}
		iterator.filled = flag;
	}
	return;
}

module.exports = {
	addFilledField
};