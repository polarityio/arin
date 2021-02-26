'use strict';

let request = require('request');
let _ = require('lodash');
let async = require('async');
let {Address6} = require('ip-address');
let fs = require('fs');
let config = require('./config/config');

let log = null;
let requestWithDefaults;
let previousIpRegexAsString = '';
let ipBlacklistRegex = null;

const BASE_URI = 'https://whois.arin.net/rest/ip/';

function startup(logger) {
    log = logger;

    let defaults = {};

    if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
        defaults.cert = fs.readFileSync(config.request.cert);
    }

    if (typeof config.request.key === 'string' && config.request.key.length > 0) {
        defaults.key = fs.readFileSync(config.request.key);
    }

    if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
        defaults.passphrase = config.request.passphrase;
    }

    if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
        defaults.ca = fs.readFileSync(config.request.ca);
    }

    if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
        defaults.proxy = config.request.proxy;
    }

    if (typeof config.request.rejectUnauthorized === 'boolean') {
        defaults.rejectUnauthorized = config.request.rejectUnauthorized;
    }

    requestWithDefaults = request.defaults(defaults);
}

function _setupRegexBlacklists(options) {
    if (options.ipBlacklistRegex !== previousIpRegexAsString && options.ipBlacklistRegex.length === 0) {
        log.debug("Removing IP Blacklist Regex Filtering");
        previousIpRegexAsString = '';
        ipBlacklistRegex = null;
    } else {
        if (options.ipBlacklistRegex !== previousIpRegexAsString) {
            previousIpRegexAsString = options.ipBlacklistRegex;
            log.debug({ipBlacklistRegex: previousIpRegexAsString}, "Modifying IP Blacklist Regex");
            ipBlacklistRegex = new RegExp(options.ipBlacklistRegex, 'i');
        }
    }
}

function doLookup(entities, options, cb) {
    let blacklist = options.blacklist;
    let checkv6 = options.lookupIPv6;
    let lookupResults = [];

    _setupRegexBlacklists(options);

    log.trace({entities: entities}, 'Entities');

    async.each(entities, function (entityObj, next) {
        if (_.includes(blacklist, entityObj.value)) {
            next(null);
        } else if ((entityObj.isIPv4 && !entityObj.isPrivateIP) || (entityObj.isIPv6 && checkv6 === true && new Address6(entityObj.value).isValid())) {
            if (ipBlacklistRegex !== null) {
                if (ipBlacklistRegex.test(entityObj.value)) {
                    log.debug({ip: entityObj.value}, 'Blocked BlackListed IP Lookup');
                    return next(null);
                }
            }

            _lookupEntity(entityObj, options, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    lookupResults.push(result);
                    next(null);
                }
            });
        } else {
            next(null);
        }
    }, function (err) {
        log.debug({lookupResults: lookupResults}, "Result Values:");
        cb(err, lookupResults);
    });
}


function _processRequest(err, response, body, entityObj, cb){
    if (err) {
        log.error({err: err}, "Request Error");
        cb(_createJsonErrorPayload("Failed to complete HTTP Request", null, '500', '2A', 'Unable to Process Request', {
            err: err
        }));
        return;
    }

    if (response.statusCode === 500) {
        log.error({err: err}, "500 HTTP Status Code Error");
        cb(_createJsonErrorPayload("ARIN server was unable to process your request", null, '500', '2A', 'Unable to Process Request', {
            err: err
        }));
        return;
    }

    if (response.statusCode === 404) {
        cb(null, {entity: entityObj, data: null}); //Cache the missed results
        return;
    }

    if (response.statusCode === 400) {
        cb(_createJsonErrorPayload("Bad Request", null, '400', '2A', 'Bad Request', {
            entity: entityObj.value,
            err: err,
            response: response
        }));
        return;
    }

    if (response.statusCode !== 200) {
        cb(_createJsonErrorPayload("Unexpected HTTP Status Code", null, response.statusCode, '2A', 'Unexpected Status', {
            statusCode: response.statusCode,
            body: body,
            entity: entityObj
        }));
        return;
    }

    log.trace({body: body}, "Printing out the results of Body ");

    if (_.isNil(body) || _.isNil(body.net) || _.isNil(body.net.parentNetRef) || _.isNil(body.net.orgRef)) {
        cb(null, {entity: entityObj, data: null}); //Cache the missed results
        return;
    }

    // If ARIN returns malformed JSON then the `body` object will be a string.  If it's
    // valid JSON that we are expecting then it will be an object.  See why body will be a
    // string on JSON parse error in this issue: https://github.com/request/request/issues/440
    if (response && typeof body === 'string') {
        cb(null, {entity: entityObj, data: null}); //Cache the missed results
        log.trace({error: err}, "ARIN Response is not JSON"); // ARIN response not JSON
        return;
    }

    let cidrLength;

    if (Array.isArray(_.get(body, 'net.netBlocks.netBlock'))) {
        cidrLength = _.get(body, 'net.netBlocks.netBlock[0].cidrLength', '0');
    } else {
        cidrLength = _.get(body, 'net.netBlocks.netBlock.cidrLength', '0');
    }

    // The lookup results returned is an array of lookup objects with the following format
    cb(null, {
        // Required: This is the entity object passed into the integration doLookup method
        entity: entityObj,
        // Required: An object containing everything you want passed to the template
        data: {
            // Required: These are the tags that are displayed in your template
            summary: [_.get(body, 'net.orgRef.@name', 'No Org Available')],
            // Data that you want to pass back to the notification window details block
            details: {
                allData: body,
                //Organization
                orgHandle: _.get(body, 'net.orgRef.@handle'),
                orgName: _.get(body, 'net.orgRef.@name'),
                orgRef: _.get(body, 'net.orgRef.$'),
                //Network Details
                netBlockHandle: _.get(body, 'net.handle.$'),
                netBlockName: _.get(body, 'net.name.$'),
                netBlockCIDR: _.get(body, 'net.startAddress.$', '') + '/' + _.get(cidrLength, '$', ''),
                startAddr: _.get(body, 'net.startAddress.$'),
                endAddr: _.get(body, 'net.endAddress.$'),
                netBlockRef: _.get(body, 'net.ref.$'),
                regDate: _.get(body, 'net.registrationDate.$'),
                upDate: _.get(body, 'net.updateDate.$'),
                //Parent Network
                parentHandle: _.get(body, 'net.parentNetRef.@handle'),
                parentName: _.get(body, 'net.parentNetRef.@name'),
                parentRef: _.get(body, 'body.net.parentNetRef.$')
            }
        }
    });
}


function _lookupEntity(entityObj, options, cb) {
    requestWithDefaults({
        uri: BASE_URI + entityObj.value,
        method: 'GET',
        json: true,
        headers: {
            'Accept': 'application/json'
        }
    }, function (err, response, body) {
        _processRequest(err, response, body, entityObj, cb);
    });
}

// function that takes the ErrorObject and passes the error message to the notification window
let _createJsonErrorPayload = function (msg, pointer, httpCode, code, title, meta) {
    return {
        errors: [
            _createJsonErrorObject(msg, pointer, httpCode, code, title, meta)
        ]
    }
};

// function that creates the Json object to be passed to the payload
let _createJsonErrorObject = function (msg, pointer, httpCode, code, title, meta) {
    let error = {
        detail: msg,
        status: httpCode.toString(),
        title: title,
        code: 'ARIN_' + code.toString()
    };

    if (pointer) {
        error.source = {
            pointer: pointer
        };
    }

    if (meta) {
        error.meta = meta;
    }

    return error;
};

module.exports = {
    doLookup: doLookup,
    startup: startup,
    _processRequest: _processRequest // export for testing purposes
};