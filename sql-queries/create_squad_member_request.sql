CREATE TABLE squad_member_request(
    request_id VARCHAR(200),
    squad_id VARCHAR(200),
    user_id VARCHAR(200),
    request_status VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY request_id
);