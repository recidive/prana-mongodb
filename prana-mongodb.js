var utils = require('prana/lib/utils');

/*
 * Prana MongoDB Storage.
 */

/**
 * MongoDB Storage constructor.
 *
 * @constructor
 * @param {Object} settings Storage settings.
 */
var MongoDBStorage = module.exports = function(application, settings) {
  this.application = application;
  this.settings = settings || {};

  if (!this.settings.database) {
    throw new Error('You should pass a valid mongodb client instance in settings.database.');
  }

  // Database client.
  this.database = this.settings.database || {};
};

/**
 * List stored items.
 *
 * @param {Type} type Type object.
 * @param {Object} query Optional query object.
 * @param {Function} callback Function to run when data is returned.
 */
MongoDBStorage.prototype.list = function(type, query, callback) {
  var collection = this.database.collection(type.name);
  var data = {};

  var self = this;

  collection.find(query).each(function(error, item) {
    if (error) {
      return callback(error);
    }

    if (item) {
      var key = item[type.settings.keyProperty];
      data[key] = item;
    }
    else {
      // @todo: process data and call hooks so extensions can alter data.
      callback(null, data);
    }
  });
};

/**
 * Load a stored item.
 *
 * @param {Type} type Type object.
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is returned.
 */
MongoDBStorage.prototype.load = function(type, key, callback) {
  var query = {};
  query[type.settings.keyProperty] = key;

  var collection = this.database.collection(type.name);
  // @todo: process data and call hooks so extensions can alter data.
  collection.findOne(query, callback);
};

/**
 * Save a item.
 *
 * @param {Type} type Type object.
 * @param {Object} item Object representing the item.
 * @param {Function} callback Function to run when data is saved.
 */
MongoDBStorage.prototype.save = function(type, item, callback) {
  var collection = this.database.collection(type.name);

  if (!item[type.settings.keyProperty]) {
    callback(new Error('Error saving ' + type + '. Missing key ' + type.settings.keyProperty + '.'));
  }

  var query = {};
  query[type.settings.keyProperty] = item[type.settings.keyProperty];

  collection.findAndModify(query, [type.settings.keyProperty, 'ascending'], item, {upsert: true},  function(err, savedItem) {
    utils.extend(item, savedItem);
    callback(null, item);
  });
};

/**
 * Delete a item.
 *
 * @param {Type} type Type object.
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is deleted.
 */
MongoDBStorage.prototype.delete = function(type, key, callback) {
  var self = this;

  // Get the item to return it to the callback after deleting it. We use the
  // load() method so we return the full loaded object.
  this.load(type, key, function(error, item) {
    if (error) {
      return callabck(error);
    }

    var collection = self.database.collection(type.name);
    collection.remove({_id: item._id}, function(error, count) {
      if (error) {
        return callabck(error);
      }

      callback(null, item);
    });
  });
};
