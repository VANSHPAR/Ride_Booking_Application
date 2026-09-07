CREATE TABLE dbconstant
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    created_at datetime     NOT NULL,
    updated_at datetime     NOT NULL,
    name       VARCHAR(255) NOT NULL,
    value      VARCHAR(255) NULL,
    CONSTRAINT pk_dbconstant PRIMARY KEY (id)
);

ALTER TABLE car
    ADD CONSTRAINT uc_car_platnumber UNIQUE (plat_number);

ALTER TABLE dbconstant
    ADD CONSTRAINT uc_dbconstant_name UNIQUE (name);





ALTER TABLE car
    MODIFY plat_number VARCHAR (255) NOT NULL;