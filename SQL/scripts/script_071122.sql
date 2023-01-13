DROP TABLE `vmsback`.`work`, `vmsback`.`work_application`, `vmsback`.`work_application_answer`, `vmsback`.`work_application_attachment`, `vmsback`.`work_application_resource`, `vmsback`.`work_questionnaire`, `vmsback`.`work_resource`, `vmsback`.`work_shared`, `vmsback`.`work_shared_external`, `vmsback`.`work_skill`;

CREATE TABLE `work` (
  `work_id` varchar(200) NOT NULL,
  `squad_id` varchar(200) DEFAULT NULL,
  `work_title` varchar(200) DEFAULT NULL,
  `industry` varchar(200) DEFAULT NULL,
  `description` text,
  `state` varchar(200) DEFAULT NULL,
  `country` varchar(200) DEFAULT NULL,
  `project_type` int DEFAULT NULL,
  `projectHR_currency` varchar(200) DEFAULT NULL,
  `projectHR_amount` int DEFAULT NULL,
  `fixedHR_currency` varchar(200) DEFAULT NULL,
  `fixedHR_amount` int DEFAULT NULL,
  `billing_currency` varchar(200) DEFAULT NULL,
  `project_payment_frequency` varchar(200) DEFAULT NULL,
  `payment_terms` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `work_status` varchar(200) DEFAULT NULL,
  `sharing` varchar(200) DEFAULT NULL,
  `completion_status` varchar(200) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`work_id`)
)

CREATE TABLE `work_application` (
  `application_id` varchar(200) NOT NULL,
  `work_id` varchar(200) DEFAULT NULL,
  `squad_id` varchar(200) DEFAULT NULL,
  `application_status` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`)
)

CREATE TABLE `work_application_answer` (
  `answer_id` varchar(200) NOT NULL,
  `application_id` varchar(200) DEFAULT NULL,
  `questionnaire_id` varchar(200) DEFAULT NULL,
  `type_answer` varchar(200) DEFAULT NULL,
  `answer` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`)
)

CREATE TABLE `work_application_attachment` (
  `attachment_id` varchar(200) NOT NULL,
  `application_id` varchar(200) DEFAULT NULL,
  `file_name` varchar(200) DEFAULT NULL,
  `file_url` varchar(200) DEFAULT NULL,
  `file_type` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`)
)

CREATE TABLE `work_application_resource` (
  `resource_id` varchar(200) NOT NULL,
  `application_id` varchar(200) DEFAULT NULL,
  `user_id` varchar(200) DEFAULT NULL,
  `role_name` varchar(200) DEFAULT NULL,
  `currency` varchar(200) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`)
)

CREATE TABLE `work_questionnaire` (
  `questionnaire_id` varchar(200) NOT NULL,
  `work_id` varchar(200) DEFAULT NULL,
  `question` varchar(200) DEFAULT NULL,
  `type` varchar(200) DEFAULT NULL,
  `options` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`questionnaire_id`)
)

CREATE TABLE `work_resource` (
  `resource_id` varchar(200) NOT NULL,
  `work_id` varchar(200) DEFAULT NULL,
  `role_name` varchar(200) DEFAULT NULL,
  `currency` varchar(200) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`)
)

CREATE TABLE `work_shared` (
  `share_id` varchar(200) NOT NULL,
  `work_id` varchar(200) DEFAULT NULL,
  `squad_id` varchar(200) DEFAULT NULL,
  `work_request_status` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`share_id`)
)

CREATE TABLE `work_shared_external` (
  `external_share_id` varchar(200) NOT NULL,
  `work_id` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `recipient_name` varchar(200) DEFAULT NULL,
  `isValid` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`external_share_id`)
)

CREATE TABLE `work_skill` (
  `skill_id` varchar(200) NOT NULL,
  `work_id` varchar(200) DEFAULT NULL,
  `skill_name` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`skill_id`)
)