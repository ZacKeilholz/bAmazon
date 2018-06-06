//Todo List- 
/*
-Incorporate .env password file and add to gitignore
-Clean up Schema File / Create Seed.sql file
-Add Inquirer 

*/


//JS LIBRARIES
//===================================

//Database Library
var mysql = require("mysql");

//Password Management
require('dotenv').config();
var keys = require("./keys.js");

//File System Access
var fs = require("fs");

//Inquirer
var inquirer = require("inquirer");


//SETUP CODE
//===================================

//MySql Database Connection Setup- Change the host and port as necessary
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    //From .env And keys.js File- Create a .env file using the keys.js formatting if you do not have one
    user: keys.mySQL.user,
    password: keys.mySQL.password,

    //Database to be accessed - Premade DB Name
    database: "bamazon_db"

});


//Establish Initial MySQL Database Connection-
//==============================================

connection.connect(function (err) {
    if (err) throw err;

    //Run the start function to initiate the Main Inquirer Prompt if there is no error
    start();
})

//MAIN CODE- Inquirer Prompt
//===================================
function start() {

    connection.query("select product_name, department_name, price from products WHERE stock_quantity > 0", function (err, res) {
        if (err) throw err;
        console.log(res);
        console.log(typeof res);
        var productArr = [];
        res.forEach(function(element) {
            productArr.push(element.product_name)
            ;
        });
        console.log(productArr);

        inquirer
            .prompt({
                name: "choice",
                type: "list",
                message: "Welcome to Bamazon.  Select the Item you would like to buy.",
                choices: productArr
            })
            .then(function (answer) {
                console.log(answer.productList);
            });
    });
};


function checkConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);

    });
}


function checkItem() {

    var sqlQuery = "SELECT * FROM products where quantity < 5";

    connection.query(sqlQuery, function (err, result) {
        if (err) throw err;
        console.log("ITEMS WITH QTTY UNDER 5");


        console.log(results);
        console.log(result.forEach(function (element) {
            console.log(element.name);
        }));
    });
}




