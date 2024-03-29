# BeePositiveApiaryNodeServer

This is the node.js server for [prushton2/beepositiveapiary](https://github.com/prushton2/beepositiveapiary). This is built to store, view, and archive orders made from the site.<br>

# Setup

## Basic setup

* Run ```npm ci``` to install the dependencies
* Run ```src/setup.js``` to create ```/config/config.json``` and ```.env```
* Run ```src/index.js``` to run the program
* Edit ```config.json["domain"]["frontend-url"]``` and ```config.json["domain"]["backend-url"]```to fit your backend and frontend urls
* Edit ```config.json["environment"]["environment-type"]``` to ```development``` or ```production```

## Auth setup

* The website uses google authentication to allow users to login. Read [the documentation for google sign in](https://developers.google.com/identity/gsi/web/guides/migration#popup-mode_1) before continuing
* Update ```config.json["auth"]["GoogleOAuth2ClientID"]``` to match your client id
* The user's session is stored in the ```auth``` cookie as httpOnly, and should be sent with every request

## Sendgrid setup

The backend uses sendgrid to send an order confirmation email when a user places an order. Set up an active email in sendgrid before doing this step.

* Add the following to ```config.json["sendgrid"]```:
  * put the sender email address into ```["email"]```
  * put order confirmation template ID into ```["orderConfirmationTemplateID"]```
  * put the order completion template ID into ```["orderCompletionTemplateID"]```
  * Enable use of the API by setting ```["enabled"]``` to ```true```
* Add the following to the ```.env``` file:
  * ```SENDGRID_API_KEY=<your_sendgrid_api_key>```

# Endpoints
Index of all routes
## [Auth](#auth-auth)
## [Database](#database-db)
## [Email](#email-email)
## [Orders](#orders-orders)

---

## [Auth (/auth/*)](#endpoints)
---
### /logout (GET)
- Requires account
- Deletes the session that the user sent the request from, logging them out
### /logoutOfAll (GET)
- Requires account
- Deletes all sessions that the user sent the request from, logging them out of all devices
### /getUser (GET)
- Requires account
- Returns the user's information aswell as any extra permissions
### /google/login (POST)
Logs the user in with google

Body:
```javascript
{
    "JWT": //the JWT that google returns when the user logs in
}
```
---
## [Database (/db/*)](#endpoints)
---
### /getProducts?location= (GET)
- Specify products to return by the location column value (optional)
- Returns the products and all related info
### /update (PATCH)
- Requires admin permissions
- Updates the product tables and the users table on the backend

Body:
```javascript
{
    "table": "",//the table to modify. Either Products, ProductRelations, or Users 
    "primaryKeys": {}, //Primary keys for the row to update ex: {key: value, key: value}
    "column": "",//column to update
    "value": ""//new value for the entry
}
```
### /newEntry (POST)
- Requires admin permissions
- Adds a new entry to one of the tables allowed in the [update endpoint](#update-patch)

Body:
```javascript
{
    "table": "",//table to add new entry
    "values": {} //JSON object of new values to add to table ex: {key: value, key: value}
}
```

### /deleteEntry (DELETE)
- Requires admin permissions
- Deletes an entry from one of the allowed tables in the [update endpoint](#update-patch)

Body:
```javascript
{
    "table": "", //name of table to delete row from
    "primaryKeys": {}//primary keys identifying the row to delete ex: {key: value, key: value}
}
```
### /getJson (POST)
- Requires admin permissions
- Allows retrieval of the Products, ProductRelations, and Users tables as JSON objects

Body:
```javascript
{
	"table": "", //name of table to retrieve
}
```


### /hash (POST)
- Requires admin permission
- Hashes a given string using the same hash method used throughout the database

Body:
```javascript
{
    "text": "" //text to hash
}
```
---
## [Email (/email/*)](#endpoints)
---
### /completionEmail (POST)
- Requires admin permission
- Sends an email confirming the completion of an order to the listed email address in the order, aswell as a bcc to the sender if the setting is set in ```config.json["sendgrid"]["bccToSender"]```

Body:
```javascript
{
    "orderID": 0 //ID of the order to send the completion email for
}
```
---
## [Orders (/orders/*)](#endpoints)
---
### /add (POST)
- No required account
- Places an order in the database

Body:
```javascript
{
  "wantsToReceiveEmails": true, //Determines if the user wants to receive emails (Order confirmation and order completion)
  "Order": {
    "name": "",//Name
    "email": "",//Email
    "address": "",//Address
    "phoneNumber": ""//Phone Number
  },
  "Items": [
    {
      "productID": "",//ID of the product
      "subProductID": "",//ID of the subproduct
      "amount": 0//Amount of the product
    } //This object can be repeated to include multiple products in one order
  ]
}
```

### /getByKey?orderID={order id}&viewKey={view key} (GET)
- No required permission
- This is used to allow users to view their order after it is placed without an account

### /action/archive (PATCH)
- Requires admin permission
- Archives an order, preventing it from being viewable through the [/getByKey endpoint](#getbykey-post)

Body:
```javascript
{
    "orderID": 0 //id of order to archive
}
```

### /action/complete (PATCH)
- Requires admin permission
- Changes the complete status of an order (doesnt send completion email)

Body:
```javascript
{
    "orderID": 0, //id of order to edit
    "value": true //new completion status
}
```
### /get/all (GET)
- Requires admin permissions
- Returns all orders in the database

### /get/placed (GET)
- Requires user permissions
- Returns all orders in the database that the logged in user placed