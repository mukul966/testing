ALTER TABLE `vmsback`.`squad_service` CHANGE COLUMN `info` `info` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`squad` ADD UNIQUE (`squad_name`);
