-- The following is the SQL Schema for the Bamazon Project

-- DROP DATABASE IF EXISTS bamazon_db;
-- CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
    item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(45) NOT NULL,
    department_name VARCHAR(45) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
);



INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Pickles", "Non-Perishable Goods", 8.99, "55");

SELECT * FROM bamazon_db.products LIMIT 1000;
