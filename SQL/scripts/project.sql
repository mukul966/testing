DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `project_skill`;
DROP TABLE IF EXISTS `project_resource`;
DROP TABLE IF EXISTS `project_attachment`;
DROP TABLE IF EXISTS `project_milestone`;

-- TABLE: project_table
CREATE TABLE project (
    project_id VARCHAR(200) PRIMARY KEY,
    client_squad_id VARCHAR(200),
    vendor_squad_id VARCHAR(200),
    archive_work_id VARCHAR(200),
    archive_application_id VARCHAR(200),
    project_status VARCHAR(200),
    project_title VARCHAR(200),
    industry VARCHAR(200),
    description text,
    state VARCHAR(200),
    country VARCHAR(200),
    project_type INT,
    projectHR_currency VARCHAR(200),
    projectHR_amount INT,
    fixedHR_currency VARCHAR(200),
    fixedHR_amount INT,
    billing_currency VARCHAR(200),
    project_payment_frequency VARCHAR(200),
    payment_terms INT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: project_skill table
CREATE TABLE project_skill (
  skill_id varchar(200) primary key,
  project_id varchar(200),
  skill_name varchar(200),
  created_at timestamp  DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: project_resource
CREATE TABLE project_resource (
  resource_id varchar(200) primary key,
  project_id varchar(200),
  user_id varchar(200),
  role_name varchar(200),
  currency varchar(200),
  hourly_rate varchar(200),
  created_at timestamp  DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: project_attachment
CREATE TABLE project_attachment (
  attachment_id varchar(200) primary key,
  project_id varchar(200),
  file_name varchar(200),
  file_url varchar(200),
  file_type varchar(200),
  created_at timestamp  DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: project_milestone table
CREATE TABLE project_milestone (
    milestone_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255),
    name VARCHAR(255),
    currency VARCHAR(200),
    amount INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);