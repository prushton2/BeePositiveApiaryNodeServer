# Progress on migrating the database to JSON

## In Progress

## Known
* Archive.js
    * Need to change file extensions
* db.js
    * You already know nothing from here is staying
* email.js
    * The orders and purchases
* orders.js
    * all of the endpoints
* purchases
    * to be removed (stupid)
* sendgrid.js
    * change how it gets the order info

## Completed
* authManager.js
    * Every endpoint
    * Change sessions to use JWTs instead of custom sessions
* auth.js
    * /getUser(s) endpoints

* index.js
    * use cases of the tables should be removed with the new database, the current uses are for my sanity
* database.js
    * rewrite to allow this to not happen in the future, use as a proxy to the database
* verification.js
    * rewrite the verifySession function 