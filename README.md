# BeePositiveApiaryNodeServer

This is a node.js server for [prushton2/beepositiveapiary](https://github.com/prushton2/beepositiveapiary) This is built to store and manage orders made from the site.<br>
## Endpoints

### /add (POST)
Adds an order to the database<br>
Body:
```javascript
{
  "Order": {
    "name": Name (String)
    "email": Email (String)
    "address": Address (String)
    "phoneNumber": Phone Number (String)
  },
  "Items": [
    {
      "productID": ID of the product (String)
      "amount": Amount of the product (Integer)
    } //This object can be repeated to include multiple orders
  
  ]
}

```
### /getPurchases (POST)
Gets purchases by orderID<br>
Body:
```javascript
{
  "password": password (String)
  "orderID": id of order to grab from (Integer)
}

```
