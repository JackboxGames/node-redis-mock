/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var EXPIRES_NEVER = -1;

/**
 * Transforms the argument to a string
 */
var stringify = function(value) {
    return typeof(value) === "object" ?
            JSON.stringify(value) :
            value + '';
};

/**
 * Constructor of the main class RedisItem
 */
var RedisItem = function (type, expire) {
    // We keep type so we don't have to use instanceof maybe this
    // can be changed to something more clever
    this.type = type || 0;
    this.expires = expire || EXPIRES_NEVER;
};

/**
 * Constructor of a string
 */
var RedisString = function(value, expires) {
    RedisItem.call(this, "string", expires);
    this.value = stringify(value);
};
util.inherits(RedisString, RedisItem);

/**
 * Constructor of an hash
 */
var RedisHash = function() {
    RedisItem.call(this, "hash");
    this.value = {};
};
util.inherits(RedisHash, RedisItem);


var RedisList = function() {
  RedisItem.call(this, "list");
  this.value = [];
};
util.inherits(RedisList, RedisItem);

RedisList.prototype.rpush = function(values) {
    for (var i = 0; i < values.length; i++) {
        this.value.push(stringify(values[i]));
    }
};

RedisList.prototype.lpush = function(values) {
    for (var i = 0; i < values.length; i++) {
        this.value.unshift(stringify(values[i]));
    }
};

RedisList.prototype.rpop = function(value) {
    return this.value.pop();
};

RedisList.prototype.lpop = function(value) {
    return this.value.shift();
};

RedisList.prototype.ltrim = function(startIndex, endIndex) {
    if ( (endIndex+1) < this.value.length )
    {
        this.value.splice( endIndex+1, this.value.length-endIndex+1 );
    }
    
    if ( startIndex > 0 )
    {
        this.value.splice( 0, startIndex );
    }
    return this.value;
};

/**
 * Constructor of a set
 */
var RedisSet = function() {
  RedisItem.call(this, "set");
  this.value = [];
};
util.inherits(RedisSet, RedisItem);

/**
 * Constructor of a sorted set
 */
var RedisSortedSet = function() {
    RedisItem.call(this, "zset");
    this.value = [];
}

util.inherits(RedisSortedSet, RedisItem);

var RedisItemFactory = {
    _item: RedisItem,
    _string: RedisString,
    _hash: RedisHash,
    _list: RedisList,
    _set: RedisSet,
    _zset: RedisSortedSet,
    _stringify: stringify
};

RedisItemFactory.createString = function(elt, expire) {
    return new RedisString(elt, expire);
};

RedisItemFactory.createHash = function() {
  return new RedisHash();
};

RedisItemFactory.createList = function() {
  return new RedisList();
};

RedisItemFactory.createSet = function() {
    return new RedisSet();
};

RedisItemFactory.createSortedSet = function() {
    return new RedisSortedSet();
}

RedisItemFactory.EXPIRES_NEVER = EXPIRES_NEVER;

/**
 * Export the constructor
 */
module.exports = exports = RedisItemFactory;
