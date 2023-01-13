ALTER TABLE `vmsback`.`work` CHANGE COLUMN `description` `work_details` TEXT NULL DEFAULT NULL ;

-- CREATE TABLE: questionnaire
CREATE TABLE work_question(
    question_id VARCHAR(200),
    work_id VARCHAR(200),
    question VARCHAR(200),
    question_type VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY question_id
);

-- CREATE TABLE: answers
CREATE TABLE work_answer(
    answer_id VARCHAR(200),
    question_id VARCHAR(200),
    squad_id VARCHAR(200),
    answer VARCHAR(200)
);

-- CREATE TABLE: options
CREATE TABLE work_option(
    option_id VARCHAR(200),
    question_id VARCHAR(200),
    squad_id VARCHAR(200),
);
