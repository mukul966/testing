const crypto = require('crypto');

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

module.exports = BankAccount;