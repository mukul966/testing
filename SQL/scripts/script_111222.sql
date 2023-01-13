DROP TABLE IF EXISTS invoice_billing_resource_hourly;
DROP TABLE IF EXISTS invoice_resource;

CREATE TABLE `invoice_billing_resource_hourly` (
  `id` varchar(200) NOT NULL,
  `invoice_id` varchar(200) DEFAULT NULL,
  `resource_id` varchar(200) DEFAULT NULL,
  `hours` INT DEFAULT NULL,
  `amount` INT DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `invoice_billing_fixed_fee` (
  `id` varchar(200) NOT NULL,
  `invoice_id` varchar(200) DEFAULT NULL,
  `milestone_id` varchar(200) DEFAULT NULL,
  `billable_amount` INT DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `invoice_billing_project_hourly` (
  `id` varchar(200) NOT NULL,
  `invoice_id` varchar(200) DEFAULT NULL,
  `hours` INT DEFAULT NULL,
  `amount` INT DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

ALTER TABLE `vmsback`.`invoice_add_on` RENAME TO  `vmsback`.`invoice_billing_add_on` ;
ALTER TABLE `vmsback`.`invoice_billing_add_on` CHANGE COLUMN `category` `category` VARCHAR(200) NULL DEFAULT NULL , CHANGE COLUMN `name` `name` VARCHAR(200) NULL DEFAULT NULL ;