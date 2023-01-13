DROP TABLE work_option IF EXISTS;
DROP TABLE work_application_resource IF EXISTS;

CREATE TABLE `work_application_answer` (
  `answer_id` varchar(200) NOT NULL,
  `application_id` varchar(200) DEFAULT NULL,
  `questionnaire_id` varchar(200) DEFAULT NULL,
  `type_answer` INT,
  `answer` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`)
)

/*
CREATE TABLE `work_application_option` (
  `op_answer_id` varchar(200) NOT NULL,
  `answer_id` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`)
)
*/

CREATE TABLE `work_application_resource` (
  `resource_id` varchar(200) NOT NULL,
  `application_id` varchar(200) DEFAULT NULL,
  `user_id` varchar(200) DEFAULT NULL,
  `role_name` varchar(200) DEFAULT NULL,
  `currency` varchar(200) DEFAULT NULL,
  `amount` INT,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`)
)

ALTER TABLE `vmsback`.`work_application_answer` CHANGE COLUMN `type_answer` `type_answer` VARCHAR(200) NULL DEFAULT NULL ;
