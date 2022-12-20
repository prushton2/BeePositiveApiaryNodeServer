# Formatting for instances of stuff in json

## Products.json
```javascript
"ID": {
    "name":        "string",
    "description": "string",
    "location":    "string, items or honey",
    "imageURL":    "string, url to image",
    "stock":       64,
    "relations": {
        "subProductID": {
            "price": 2.99
        }
    }
}
```

## Users.json
```javascript
"ID": {
    "authID":      "string, id of the user from their chosen authentication service",
    "authType":    "string, service the user used to authenticate",
    "name":        "string",
    "pfpURL":      "string",
    "email":       "string",
    "permissions": "string, user or admin",

    "sessions": [
        "string, user's JWT"
    ]
}
```

## Orders.json
```javascript
"ID": {
    "name":         "string",
    "address":      "string, full address",
    "email":        "string",
    "phoneNumber":  "string",
    "isComplete":   "boolean, is the order complete (Doesnt mean delivered)",
    "date":         "string, unix timestamp order is made",
    "emailSent":    "boolean, has the email saying the order is done been sent yet",
    "viewKey":      "string, hashed string allowing non logged in user to view their order",
    "owner":        "string, owner id of the order",

    "purchases": [
        {
            "productID": "string",
            "subProductID": "string",
            "amount": 0
        }
    ]
}
```

## ArchivedOrders.json
Same as Orders.json<br>



