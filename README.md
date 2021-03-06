# BeePositiveApiaryNodeServer

This is the node.js server for [prushton2/beepositiveapiary](https://github.com/prushton2/beepositiveapiary). This is built to store, view, and archive orders made from the site.<br>

## Setup

### Basic setup

* Run ```npm ci``` to install the dependencies
* Run ```src/setup.js``` to create ```/config/config.json``` and ```.env```
* Run ```src/index.js``` to run the program
* Edit the ```config.json["domain"]["frontend-url"]``` and ```config.json["domain"]["backend-url"]```to fit your backend and frontend urls

### Auth setup

* Create a post request to ```/hash``` following the [endpoint guide for /hash](#hash-get)
  * The default password is password
  * Put the password you want to hash in the value of string
* Add the hashed string to the list in ```config.json["auth"]["passwords"]``` to put the password in use
* delete the default password

### Sendgrid setup

The backend uses sendgrid to send an order confirmation email when a user places an order.

* Add the following to ```config.json["sendgrid"]```:
  * put the sender email address into ```["email"]```
  * put order confirmation template ID into ```["orderConfirmationTemplateID"]```
  * put the order completion template ID into ```["orderCompletionTemplateID"]```
  * Enable use of the API by setting ```["enabled"]``` to ```true```
* Add the following to the ```.env``` file:
  * ```SENDGRID_API_KEY=<your_sendgrid_api_key>```

# Endpoints

## /orders
### /add (POST)
Adds an order to the database<br>
Body:
```javascript
{
  "wantsToReceiveEmails" //Determines if the user wants to receive emails (Order confirmation and order completion) (boolean)
  "Order": {
    "name": //Name (String)
    "email": //Email (String)
    "address": //Address (String)
    "phoneNumber": //Phone Number (String)
  },
  "Items": [
    {
      "productID": //ID of the product (String)
      "subProductID": //ID of the subproduct (String)
      "amount": //Amount of the product (Integer)
    } //This object can be repeated to include multiple orders
  ]
}

```
### /getByKey (POST)
Gets all the information about an order given the orderID and viewKey. Meant to be used for the customer to view their order after it being placed<br>
Body:
```javascript
{
  "orderID": //password (String)
  "viewKey": //string to hash (String)
}

```
### /get (POST)
Gets all orders<br>
Body:
```javascript
{
  "password": //password (String)
  "getArchived": //Get the archived orders (boolean) Not including this assumes it is false
}
```
### /complete (PATCH)
Changes the complete status of an order<br>
Body:
```javascript
{
  "password": //password (String),
  "orderID": //OrderID to edit (int),
  "completeStatus": //new complete status (Boolean)
}
```
### /archive (POST)
Archives Order<br>
Body:
```javascript
{
  "password": //password (String)
  "orderID": //id of order to archive (Integer)
}

```
## /purchases
### /get (POST)
Gets purchases by orderID<br>
Body:
```javascript
{
  "password": //password (String)
  "orderID": //id of order to grab from (Integer)
  "getArchived": //Get the archived purchases (boolean) Not including this assumes it is false
}
```
## /db
### /getProducts (GET)
returns all the products in inventory<br><br>
### /hash (POST)
hashes a given string with the same hash used for the passwords<br>
Body:
```javascript
{
  "password": //password (String)
  "text": //string to hash (String)
}
```

### /update (PATCH)
updated a specific column of a specific entry in either the Products or ProductRelations tables
```javascript
{
    "password": 
    "table": 
    "primaryKeys": 
    "column": 
    "value": 
}
```

### /newEntry (PATCH)
adds a specific entry in either the Products or ProductRelations tables
```javascript
{
    "password": "{{password}}",
    "table": "Products",
    "values" {} //values for the new row
}
```


## /email
### /completionEmail (POST)
Sends an email to the user when an order is completed<br>
Body:
```javascript
{
  "password": //password (String)
  "orderID": //id of order to grab from (int)
}

```









