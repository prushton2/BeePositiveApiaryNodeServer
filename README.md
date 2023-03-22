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
### /getUser (GET)
- Requires account
- Returns the user's information aswell as any extra permissions
### /setUser (POST)
- Requires ```permissions.users.setUser```
- Sets user parameters

Body:
```javascript
{
	"id": "" //user id
	"userData": {} //JSON object of the new userdata to set
}
```

### /getUsers (GET)
- Requires ```permissions.users.getUser```
- Gets all users

---
## [Database (/db/*)](#endpoints)
---
### /getProducts?location= (GET)
- No Permission
- Specify products to return by the location query parameter value (optional)
- Returns the products and all related info
### /setProduct (PATCH)
- Requires ```permissions.products.set```
- Updates the product tables and the users table on the backend

Body:
```javascript
{
    "id": "", //id of the product to create or update
    "newProduct": {}, //JSON object containing all the parameters to set
}
```
---
## [Email (/email/*)](#endpoints)
---
### /completionEmail (POST)
- Requires ```permissions.orders.sendEmail```
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
- Returns the order ID and secret to view the order
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
- Returns order information
- This is used to allow users to view their order after it is placed without an account

### /get/all (GET)
- Requires ```permissions.orders.get```
- Returns all placed orders, active and archived

### /action/archive (PATCH)
- Requires ```permissions.orders.archive```
- Archives an order

Body:
```javascript
{
    "orderID": 0 //id of order to archive
}
```

### /action/complete (PATCH)
- Requires ```permissions.orders.complete``` permission
- Changes the complete status of an order (doesnt send completion email)

Body:
```javascript
{
    "orderID": 0, //id of order to edit
    "value": true //new completion status
}
```

### /action/pay (PATCH)
- Requires ```permissions.orders.pay``` permission
- Changes the complete status of an order (doesnt send completion email)

Body:
```javascript
{
    "orderID": 0, //id of order to edit
    "value": true //new completion status
}
```