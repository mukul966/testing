-- CREATE TABLE: table2
CREATE TABLE table2(
    payment_id VARCHAR(200),
    client_squad_id VARCHAR(200),
    vendor_squad_id VARCHAR(200),
    amount INT,
    currency VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id)
);
