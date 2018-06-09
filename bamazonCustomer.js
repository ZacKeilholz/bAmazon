
//JS LIBRARIES
//===================================
//Console Table Module
const cTable = require('console.table');

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

//MAIN CODE- Inquirer Prompt - Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
//===================================
function start() {

    //Retrieve Up to Date Product Info From SQL Database
    connection.query("SELECT item_id, product_name, price FROM products WHERE stock_quantity > 0", function (err, res) {
        if (err) throw err;

        console.log(`Welcome to Bamazon.  Select the Item you would like to buy; Items are sorted by: ID  |  Product Name   |  Price`);

        //Display List of Items for Sale
        console.table(res);

        //Get Product ID and QTTY from User for Items they would like to purchase using Inquirer
        inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "Please Enter the ID of the Product You Would Like to Purchase",

                //Validate the Input
                validate: function (value) {
                    if (isNaN(value) || parseInt(value) > res.length || parseInt(value) < 0) {
                        return "Please Provide a Valid Product ID";
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "qty",
                message: "How much would you like to purchase?",
                validate: function (value) {
                    if (isNaN(value)) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        ]).then(function (answer) {
            checkAmounts(answer);
        });
    });
};

//This Function is used to Compare a Value To Stock of All Products in DB

function checkAmounts(value) {
    // Check to see if quantity is available
    connection.query(`select product_name, stock_quantity, price from products WHERE item_id = ${value.id}`, function (err, res) {
        //error Check
        if (err) throw err;

        //Create Variables for retrieved SQL Info for later use
        var sqlProductName = res[0].product_name;
        var sqlProductQuantity = res[0].stock_quantity;
        var sqlProductPrice = res[0].price;

        //Check if there is enough in stock to match requested customer qtty
        if (value.qty <= res[0].stock_quantity) {

            //Updated Quantity to be sent into the UPDATE sql query
            var sqlUpdatedQuantity = parseInt(sqlProductQuantity) - parseInt(value.qty);

            console.log(`Hell Yes! You just purchased ${value.qty} of ${sqlProductName} for $ ${(value.qty * sqlProductPrice).toFixed(2)}
            \nWould you Like to Buy Something Else?`);

            //Update SQL Database Quantities
            updateSQL(value.id, sqlUpdatedQuantity);

            //Prompt user to Play again
            playAgain();

        } else {
            //If there is Not enough in stock:
            console.log(`"Not enough of this item in stock!- Current Inventory of : ${res[0].stock_quantity}`);

            //Restart Bamazon Prompt
            start();
        }
    });
}


//Prompt User via Inquirer to Purchase More Items
function playAgain() {

    //Create Inquirer Question
    var question =
        [
            {
                type: "list",
                name: "again",
                message: "Would you like to purchase something else?",
                choices: ['Yes', 'No']
            }
        ];

    inquirer.prompt(question).then(answers => {
        if (answers.again == 'Yes') {
            console.log("Let's Purchase Something Else");
            start();
        } else {
            console.log(`
            \nThank you for shopping Bamazon!  
            \nGoodbye!`);
            connection.end();
        }
    });
}

//Updates the SQL products table to reflect the change in quantity 
function updateSQL(id, quantity) {

    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: quantity
            },
            {
                item_id: id
            }
        ],
        function (err, res) {
            if (err) throw err;
        });

    //Debug Query Output
    //console.log(query.sql);
}








