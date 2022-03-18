# BeePositiveApiaryNodeServer

This is a node.js server for [prushton2/beepositiveapiary](https://github.com/prushton2/beepositiveapiary) This is built to store and manage orders made from the site.<br>
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
### /getPurchases (POST)
Gets purchases by orderID<br>
Body:
```javascript
{
  "password": //password (String)
  "orderID": //id of order to grab from (Integer)
}

```

### /getOrders (POST)
Gets all orders<br>
Body:
```javascript
{
  "password": //password (String)
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
