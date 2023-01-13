-- CREATE TABLE: squad_request_external
CREATE TABLE squad_request_external(
    request_id VARCHAR(200),
    user_id VARCHAR(200),
    squad_id VARCHAR(200),
    email VARCHAR(200),
    first_name VARCHAR(200),
    last_name VARCHAR(200),
    type VARCHAR(200),
    isValid VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id)
);

-- CREATE TABLE: archive_squad_request_external
CREATE TABLE archive_squad_request_external(
    request_id VARCHAR(200),
    user_id VARCHAR(200),
    squad_id VARCHAR(200),
    email VARCHAR(200),
    first_name VARCHAR(200),
    last_name VARCHAR(200),
    type VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id)
);

ALTER TABLE `vmsback`.`user_interest` CHANGE COLUMN `type` `type` TEXT NULL DEFAULT NULL ;