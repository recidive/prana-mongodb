# Prana MongoDB Storage

MongoDB Storage for the [Prana Framework](http://pranajs.com/).

## Installation

    $ npm install prana-mongodb

## Basic usage

```js
var Prana = require('prana');
var MongoDBStorage = require('prana-mongodb');
var MongoClient = require('mongodb').MongoClient;

// Create a prana application.
var application = new Prana();

// Connect to MongoDB server.
MongoClient.connect('mongodb://localhost/database', function(error, database) {

  // Add the 'mongodb' storage.
  application.storage('mongodb', {
    controller: MongoDBStorage,
    database: database
  });

  var Cache = application.type('cache', {
    title: 'Cache',
    description: 'A very simple key/value cache storage mechanism.',
    path: 'cache',
    // Set storage for this type to 'mongodb'.
    storage: 'mongodb'
  });

  // Create a cache item.
  var cache = new Cache({
    name: 'some-cache',
    value: 'some-cache-value'
  });

  // Save item to MongoDB.
  cache.save(function(error, item) {
    console.log('Added item');
    console.log(item);

    // Optionally close MongoDB connection to end the process.
    database.close();
  });

});
```
