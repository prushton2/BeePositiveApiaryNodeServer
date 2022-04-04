# BeePositiveApiaryNodeServer

This is a node.js server for [prushton2/beepositiveapiary](https://github.com/prushton2/beepositiveapiary). This is built to store, view, and archive orders made from the site.<br>

## Setup

### Basic setup

* Install all dependencies listed in ```package.json```
* Run the program to create ```/config/config.json```
* Create the ```.env``` file in the root directory of the project

### Auth setup

* Create a post request to ```/hash``` following the [endpoint guide for /hash](#hash)
  * The default password is password
  * Put the password you want to hash in the value of string
* Add the hashed string to the list in ```config.json["auth"]["passwords"]``` to put the password in use
* delete the default password

Config.json is read on request, so you dont need to restart the program when you update it.

### Sendgrid setup

The backend uses sendgrid to send an order confirmation email when a user places an order.

* Add the following to ```config.json["sendgrid"]```:
  * put the sender email address into ```["email"]```
  * put order confirmation template ID into ```["orderConfirmationTemplateID"]```
  * Enable use of the API by setting ```["enabled"]``` to ```true```
* Add the following to the ```.env``` file:
  * ```SENDGRID_API_KEY=<your_sendgrid_api_key>```

## Endpoints

### /add (POST)
Adds an order to the database<br>
Body:
```javascript
{
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
### /getOrders (POST)
Gets all orders<br>
Body:
```javascript
{
  "password": //password (String)
  "getArchived": //Get the archived orders (boolean) Not including this assumes it is false
}

```
### /getPurchases (POST)
Gets purchases by orderID<br>
Body:
```javascript
{
  "password": //password (String)
  "orderID": //id of order to grab from (Integer)
  "getArchived": //Get the archived purchases (boolean) Not including this assumes it is false
}

```


### /complete (POST)
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

### /hash (POST)
hashes a given string with the same hash used for the passwords<br>
Body:
```javascript
{
  "password": //password (String)
  "text": //string to hash (String)
}

```

### /getProducts (GET)
returns all the products in inventory


## TODO:
* Add integration with sendgrid to send emails to people
