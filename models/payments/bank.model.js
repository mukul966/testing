const pool = require('../../routes/dbhelper').getconnection();
const secure=require('./secure')
//const BankAccountController=require('../../helpers/bank/test-controller')
const { v4: uuidv4 } = require('uuid');

const Bank = function (bank) {
	(this.bank_info_id = uuidv4()),
		(this.user_id = bank.user_id),
		(this.default = bank.default),
		//(this.account_number = secure.dataToEncrypt(bank.account_number)),// encryption of account number
            (this.account_number = bank.account_number),
		(this.account_type = bank.account_type),
		(this.pan_number = bank.pan_number),
		(this.first_name = bank.first_name),
		(this.last_name = bank.last_name),
		(this.name_on_account = bank.name_on_account),
		(this.country = bank.country),
		(this.address_line_1 = bank.address_line_1),
		(this.address_line_2 = bank.address_line_2),
		(this.city = bank.city),
		(this.pincode = bank.pincode),
		(this.phone_number = bank.phone_number);
};

Bank.createIndianBankDetails = (bankDetailsIND) =>
	new Promise((resolve, reject) => {
		const newBank = new Bank(bankDetailsIND);

		const createBankQuery = `INSERT INTO user_bank_info_ind SET ?`;
		pool.query(createBankQuery, newBank, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return {
				success: true,
				message: 'Bank details created'
			};
		})
		.catch((error) => {
			console.log('error from createIndianBankDetails() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

Bank.getBankDetails = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_bank_info_ind WHERE user_id = ?`;

		pool.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then(async (response) => {
                  response[0].account_number=await secure.masking(response[0].account_number);
			return {
				success: true,
				data: response
			};
		})
		.catch((error) => {
			console.log('error from getBankDetails() :>> ', error);
			return { success: false, data: {}, error: error.message };
		});

module.exports = Bank;
