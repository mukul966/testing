const crypto = require('crypto');
const mysql = require('mysql2');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'user',
	password: 'password',
	database: 'database'
});

class BankAccount {
	constructor(key) {
		this.key = key;
	}

	// Encrypt the bank account number
	encrypt(bankAccountNumber) {
		const cipher = crypto.createCipheriv('aes-256-cbc', this.key, Buffer.alloc(16, 0));
		const encrypted = cipher.update(bankAccountNumber, 'utf8', 'hex');
		const final = cipher.final('hex');
		return encrypted + final;
	}

	// Decrypt the bank account number
	decrypt(encryptedBankAccountNumber) {
		const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, Buffer.alloc(16, 0));
		const decrypted = decipher.update(encryptedBankAccountNumber, 'hex', 'utf8');
		const final = decipher.final('utf8');
		return decrypted + final;
	}
}

class BankAccountController {
	async create(req, res) {
		// Check the user's authentication
		if (!req.user.isAuthenticated()) {
			return res.status(401).send('Unauthorized');
		}

		// Get the key from a secure location (e.g. a configuration file)
		const key = 'secret-key';
		const bankAccount = new BankAccount(key);

		// Encrypt the bank account number
		const encryptedBankAccountNumber = bankAccount.encrypt(req.body.bankAccountNumber);

		// Create a new bank account in the database
		connection.query(
			'INSERT INTO bankAccounts (userId, bankAccountNumber) VALUES (?, ?)',
			[req.user.id, encryptedBankAccountNumber],
			(error, results) => {
				if (error) {
					return res.status(500).send(error.message);
				}
				return res.send('Bank account created');
			}
		);
	}

	async read(req, res) {
		// Check the user's authentication
		if (!req.user.isAuthenticated()) {
			return res.status(401).send('Unauthorized');
		}

		// Get the key from a secure location (e.g. a configuration file)
		const key = 'secret-key';
		const bankAccount = new BankAccount(key);

		// Get the user's bank account from the database
		connection.query('SELECT * FROM bankAccounts WHERE userId = ?', [req.user.id], (error, results) => {
			if (error) {
				return res.status(500).send(error.message);
			}
			if (results.length === 0) {
				return res.status(404).send('Bank account not found');
			}
			// Decrypt the bank account number
			const bankAccountNumber = bankAccount.decrypt(results[0].bankAccountNumber);
			return res.send(bankAccountNumber);
		});
	}

	async update(req, res) {
		// Check the user's authentication
		if (!req.user.isAuthenticated()) {
			return res.status(401).send('Unauthorized');
		}

		// Get the key from a secure location (e.g. a configuration file)
		const key = 'secret-key';
		const bankAccount = new BankAccount(key);

		// Encrypt the new bank account number
		const encryptedBankAccountNumber = bankAccount.encrypt(req.body.bankAccountNumber);

		// Update the database with the encrypted bank account number
		connection.query(
			'UPDATE bankAccounts SET bankAccountNumber = ? WHERE userId = ?',
			[encryptedBankAccountNumber, req.user.id],
			(error, results) => {
				if (error) {
					return res.status(500).send(error.message);
				}
				return res.send('Bank account number updated');
			}
		);
	}

	async delete(req, res) {
		// Check the user's authentication
		if (!req.user.isAuthenticated()) {
			return res.status(401).send('Unauthorized');
		}

		// Delete the user's bank account from the database
		connection.query('DELETE FROM bankAccounts WHERE userId = ?', [req.user.id], (error, results) => {
			if (error) {
				return res.status(500).send(error.message);
			}
			return res.send('Bank account deleted');
		});
	}


      async masking (account_number){
            const endNum=account_number.slice(-4);
            const maskNum=endNum.padStart(account_number.length,"*")
            console.log(maskNum);
            return maskNum
      }






}

module.exports={
      BankAccount,
      BankAccountController
}