ALTER TABLE `vmsback`.`user_visa` DROP COLUMN `description`, ADD COLUMN `type` VARCHAR(200) NULL DEFAULT NULL AFTER `name`;
ALTER TABLE `vmsback`.`squad` ADD UNIQUE INDEX `squad_name_UNIQUE` (`squad_name` ASC) VISIBLE;
ALTER TABLE `vmsback`.`squad_project` CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`user_project` CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`squad_alliance` CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`squad` ADD UNIQUE INDEX `squad_name_UNIQUE` (`squad_name` ASC) VISIBLE;

CREATE TABLE squad_member_request_ext(
    request_id VARCHAR(200),
    squad_id VARCHAR(200),
    email VARCHAR(200),
    first_name VARCHAR(200),
    last_name VARCHAR(200),
    type VARCHAR(200),
    request_status VARCHAR(200),
    PRIMARY KEY (request_id)
)