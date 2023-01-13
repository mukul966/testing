ALTER TABLE `vmsback`.`work_application` ADD COLUMN `counter` VARCHAR(200) NULL DEFAULT NULL AFTER `application_status`;

CREATE TABLE `work_application_counter` (
    `counter_id` VARCHAR(200) NOT NULL,
    `application_id` VARCHAR(200) DEFAULT NULL,
    `resource_id` VARCHAR(200) DEFAULT NULL,
    `new_rate` INT DEFAULT NULL,
    `new_currency` VARCHAR(200) DEFAULT NULL,
    `resource_change` VARCHAR(200) DEFAULT NULL,
    `rate_change` VARCHAR(200) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`counter_id`)
)

ALTER TABLE `vmsback`.`work_application` ADD COLUMN `complete` VARCHAR(200) NULL DEFAULT NULL AFTER `counter`;

CREATE TABLE `work_bookmark` (
    `bookmark_id` VARCHAR(255) NOT NULL,
    `work_id` VARCHAR(255) DEFAULT NULL,
    `squad_id` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`bookmark_id`)
)

ALTER TABLE `vmsback`.`work_application_resource` ADD COLUMN `counter` VARCHAR(200) NULL DEFAULT NULL AFTER `amount`;

CREATE TABLE `work_fixedFee_milestone` (
    `milestone_id` VARCHAR(255) NOT NULL,
    `work_id` VARCHAR(255) DEFAULT NULL,
    `name` VARCHAR(255) DEFAULT NULL,
    `amount` INT DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`milestone_id`)
)