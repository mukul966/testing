ALTER TABLE `vmsback`.`work_fixedfee_milestone` ADD COLUMN `test` VARCHAR(200) NULL DEFAULT NULL AFTER `updated_at`; --local sql
ALTER TABLE `vmsback`.`work_application` DROP COLUMN `counter`;
ALTER TABLE `vmsback`.`work_fixedFee_milestone` ADD COLUMN `currency` VARCHAR(200) NULL DEFAULT NULL AFTER `name`;
