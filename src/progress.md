# Progress on migrating the database to JSON

## In Progress
* orders.js
    * all of the endpoints

## Known
* Archive.js
    * Need to change file extensions

* purchases
    * to be removed (stupid)

## Completed
* sendgrid.js
    * change how it gets the order info
* email.js
    * The orders and purchases

* db.js
    * One endpoint stayed

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