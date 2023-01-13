CREATE TABLE work_shared_external(
    external_share_id VARCHAR(200),
    work_id VARCHAR(200),
    email_id VARCHAR(200),
    company_name VARCHAR(200),
    recipient_name VARCHAR(200),
    isValid VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (external_share_id)
)