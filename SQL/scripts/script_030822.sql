ALTER TABLE `vmsback`.`work` CHANGE COLUMN `description` `work_details` TEXT NULL DEFAULT NULL ;

-- CREATE TABLE: questionnaire
CREATE TABLE work_question(
    question_id VARCHAR(200),
    work_id VARCHAR(200),
    question VARCHAR(200),
    question_type VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (question_id)
);

-- CREATE TABLE: answer
CREATE TABLE work_application_answer(
    answer_id VARCHAR(200),
    question_id VARCHAR(200),
    squad_id VARCHAR(200),
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (answer_id)
);

-- CREATE TABLE: work_question_option
CREATE TABLE work_option(
    option_id VARCHAR(200),
    question_id VARCHAR(200),
    option_value VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (option_id)
);

-- CREATE TABLE: application
CREATE TABLE work_application(
    application_id VARCHAR(200),
    work_id VARCHAR(200),
    squad_id VARCHAR(200),
    application_status VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (application_id)
);

-- CREATE TABLE: application_resource
CREATE TABLE work_application_resource(
    resource_id VARCHAR(200),
    application_id VARCHAR(200),
    user_id VARCHAR(200),
    role_name VARCHAR(200),
    amount VARCHAR(200),
    currency VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id)
);

-- CREATE TABLE: application_attachment
CREATE TABLE work_application_attachment(
    attachment_id VARCHAR(200),
    application_id VARCHAR(200),
    file_name VARCHAR(200),
    file_url VARCHAR(200),
    file_type VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (attachment_id)
);

CREATE TABLE squad_member_request( 
    request_id VARCHAR(200), 
    squad_id VARCHAR(200), 
    user_id VARCHAR(200), 
    request_status VARCHAR(200), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    PRIMARY KEY (request_id) 
); 