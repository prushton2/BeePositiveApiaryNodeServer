# BeePositiveApiaryNodeServer

This is a node.js server for [prushton2/beepositiveapiary](https://github.com/prushton2/beepositiveapiary). This is built to store, view, and archive orders made from the site.<br>

## Setup

* Install all dependencies listen in ```package.json```
* Run the program to create ```config.json```
* Create a post request to ```/testHash``` following the endpoint guide below 
  * The default password is password
  * Put the password you want to hash in the string key
* Add the hashed string to the list in ```config.json["auth"]["passwords"]``` to put the password in use
* delete the default password

Config.json is read on request, so you dont need to restart the program when you update it.
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

### /testHash (POST)
hashes a given string with the same hash used for the passwords<br>
Body:
```javascript
{
  "password": //password (String)
  "string": //string to hash (String)
}

```
