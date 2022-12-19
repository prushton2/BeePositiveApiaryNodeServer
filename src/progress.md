# Progress on migrating the database to JSON

## In Progress
* database.js
    * rewrite to allow this to not happen in the future, use as a proxy to the database

## Known
* Archive.js
    * Need to change file extensions
* authManager.js
    * Every endpoint
    * Change sessions to use JWTs instead of custom sessions
* auth.js
    * /getUser(s) endpoints
* db.js
    * You already know nothing from here is staying
* email.js
    * The orders and purchases
* orders.js
    * all of the endpoints
* purchases
    * to be removed (stupid)
* encryption.js
    * rename it (I really want to) 
    * rewrite the verifySession function 
* index.js
    * use cases of the tables should be removed with the new database, the current uses are for my sanity
* sendgrid.js
    * change how it gets the order info

## Completed