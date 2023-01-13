DROP TABLE IF EXISTS `invoice`;
DROP TABLE IF EXISTS `invoice_billing`;
DROP TABLE IF EXISTS `invoice_resource`;
DROP TABLE IF EXISTS `invoice_add_on`;
DROP TABLE IF EXISTS `invoice_grand_total`;

-- TABLE: invoice
CREATE TABLE invoice (
    invoice_id VARCHAR(200) PRIMARY KEY,
    project_id VARCHAR(200),
    vendor_squad_id VARCHAR(200),
    client_squad_id VARCHAR(200),
    invoice_number VARCHAR(200),
    invoice_type VARCHAR(200),
    invoice_status VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: invoice_billing
CREATE TABLE invoice_billing (
    invoice_billing_id VARCHAR(200) PRIMARY KEY,
    invoice_id VARCHAR(200),
    billing_frequency VARCHAR(200),
    billing_start_date DATE,
    billing_end_date DATE,
    payment_terms VARCHAR(200),
    date_of_issue DATE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- [TBD] data types for numeric values.
-- TABLE: invoice_resource
CREATE TABLE invoice_resource (
    invoice_resource_id VARCHAR(200) PRIMARY KEY,
    invoice_id VARCHAR(200),
    hourly_rate INT,
    hours INT,
    amount INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: invoice_add_on
CREATE TABLE invoice_add_on (
    add_on_id VARCHAR(200) PRIMARY KEY,
    invoice_id VARCHAR(200),
    category INT,
    name INT,
    percentage INT,
    operation VARCHAR(200),
    amount INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: invoice_grand_total
CREATE TABLE invoice_grand_total (
    grand_total_id VARCHAR(200) PRIMARY KEY,
    invoice_id VARCHAR(200),
    grand_total INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);