-- CREATE TABLE: squad_partner
CREATE TABLE squad_partner(
    partner_id VARCHAR(200),
    squad_id VARCHAR(200),
    partner_squad_id VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (partner_id)
);
