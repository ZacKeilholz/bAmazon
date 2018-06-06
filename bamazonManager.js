/*
Bamazon Manager Prompt: 

Create a new Node application called bamazonManager.js. Running this application will:


List a set of menu options:
View Products for Sale
View Low Inventory
Add to Inventory
Add New Product
If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
*/

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

//MAIN CODE- Inquirer Prompt - Running this application will first display all of the Manager Options
//===================================
function start() {

    var question =
        [
            {
                type: "list",
                name: "tasks",
                message: "What managerial task would you like to do?",
                choices: ['View Products For Sale', 'View Low Inventory', 'Add to Inventory', "Add New Product"]
            }
        ];

    inquirer.prompt(question).then(answers => {
        switch (answers.tasks) {

            case "View Products For Sale":
                console.log("Viewing All Products for Sale");
                runQuery("SELECT * FROM products", printProduct);
                break;
            case "View Low Inventory":
                console.log("Viewing Items With Low Inventory (Quantity < 10) ");
                runQuery("SELECT * FROM products WHERE stock_quantity < 10", printProduct);

                break;
                
            case "Add to Inventory":
                console.log("Adding to Inventory");
                runQuery("SELECT * FROM products", updateInventory);

                break;

            case "Add New Product":
                console.log("Adding New Product");

                break;

            default:

                break;
        }
    });
}


//This function runs after the Query function has run and returned value from the bamazon_db.
function updateInventory(res) {
    var queryResult = res;

    var question =
        [
            {
                type: "input",
                name: "id",
                message: "Which Product ID would you like to add inventory for?",
                validate: function (value) {
                    if (isNaN(value) || parseInt(value) > res.length || parseInt(value) < 0) {
                        return "Not a Valid ID";
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "qty",
                message: "Please provide an updated stock quantity for this item.",
                validate: function (value) {
                    if (isNaN(value)) {
                        return "Not a Valid Quantity";
                    } else {
                        return true;
                    }
                }
            }
        ];

    inquirer.prompt(question).then(answers => {

        var query = connection.query("UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: answers.qty
                },
                {
                    item_id: answers.id
                }
            ],
            function (err, res) {
                if (err) throw err;
                console.log("updated Quantity!");
            });
        start();
    });
}


function runQuery(query, callback) {
    newQuery = connection.query(query, function (err, res) {
        if (err) throw err;
        callback(res);
    });
};

function printProduct(res) {
    var arr = [];
    res.forEach(element => {
        arr.push(element.item_id + " | " + element.product_name + " | " + element.price + " | " + element.stock_quantity);
    });
    console.log(arr);

    //Restart Mananger Sequence
    start();
}


// //Retrieve Up to Date Product Info From SQL Database
// connection.query("SELECT item_id, product_name, price FROM products WHERE stock_quantity > 0", function (err, res) {
//     if (err) throw err;

//     console.log(`Welcome to Bamazon.  Select the Item you would like to buy; Items are sorted by: ID  |  Product Name   |  Price`);

//     //Display List of Items for Sale
//     console.log(displayItems(res));

//     //Get Product ID and QTTY from User for Items they would like to purchase using Inquirer
//     inquirer.prompt([
//         {
//             type: "input",
//             name: "id",
//             message: "Please Enter the ID of the Product You Would Like to Purchase",

//             //Validate the Input
//             validate: function (value) {
//                 if (isNaN(value) || parseInt(value) > res.length || parseInt(value) < 0) {
//                     return "Please Provide a Valid Product ID";
//                 } else {
//                     return true;
//                 }
//             }
//         },
//         {
//             type: "input",
//             name: "qty",
//             message: "How much would you like to purchase?",
//             validate: function (value) {
//                 if (isNaN(value)) {
//                     return false;
//                 } else {
//                     return true;
//                 }
//             }
//         }
//     ]).then(function (answer) {
//         checkAmounts(answer);
//     });
// });
// };


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

//Takes MySQL Result and Displays all items for sale (***USE NPM TABLE TO FORMAT THIS IF THERE IS EXTRA TIME)
function displayItems(res) {
    var arr = [];
    res.forEach(element => {
        arr.push(element.item_id + " | " + element.product_name + " | " + element.price);
    });
    return arr;
}






