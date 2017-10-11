'use strict';

let request = require('request');
let _ = require('lodash');
let util = require('util');
let async = require('async');
let log = null;
var arinuri = '';

function startup(logger) {
    log = logger;
}

function doLookup(entities, options, cb) {

    let blacklist = options.blacklist;

    let checkv6 = options.lookupIPv6;

    let lookupResults = [];

    async.each(entities, function (entityObj, next) {
        if (_.includes(blacklist, entityObj.value)) {
            next(null);
        }
        else if ((entityObj.isIPv4 && !entityObj.isPrivateIP) || (entityObj.isIPv6 && checkv6 == true) || entityObj.types.indexOf('custom.IPv4CIDR') >= 0) {
            _lookupEntity(entityObj, options, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    lookupResults.push(result);
                    log.debug({result: result}, "Result Values:");
                    next(null);
                }
            });
        } else {
            next(null);
        }
    }, function (err) {
        cb(err, lookupResults);
    });
}


function _lookupEntity(entityObj, options, cb) {
    log.debug({entity: entityObj.value}, "What is the entity");

    if (entityObj.value) {

        if (entityObj.types.indexOf('custom.IPv4CIDR') >= 0) {
            arinuri = 'cidr';
        } else {
            arinuri = 'ip';
        }

        //Debug check for API endpoint URI  assignment

        log.trace({arinuri: arinuri}, "What is the ARIN API enpoint");

        request({
            uri: 'http://whois.arin.net/rest/' + arinuri + '/' + entityObj.value,
            method: 'GET',
            json: true,
            headers: {
                'Accept': 'application/json'
            }
        }, function (err, response, body) {
            if (err) {
                log.error({err:err}, "Request Error");
                cb(err);
                return;
            }

            if (response.statusCode === 500) {
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
                    err: err
                }));
                return;
            }

            if (response.statusCode !== 200) {
                cb({
                    statusCode: response.statusCode,
                    body: body,
                    entity: entityObj
                });
                return;
            }
            log.trace({netblock: _.isArray(body.net.netBlocks)}, "Checking to see if the value is true or false");
            log.trace({body: body}, "Printing out the results of Body ");


            if(_.isNil(body) || _.isNil(body.net) || _.isNil(body.net.parentNetRef) || _.isNil(body.net.orgRef)){
                cb(null, {entity: entityObj, data: null}); //Cache the missed results
                return;
            }

            log.debug({body: body}, "Printing out the results of Body 22");

            // If ARIN returns malformed JSON then the `body` object will be a string.  If it's
            // valid JSON that we are expecting then it will be an object.  See why body will be a
            // string on JSON parse error in this issue: https://github.com/request/request/issues/440
            if (response && typeof body === 'string') {
                cb(null, {entity: entityObj, data: null}); //Cache the missed results
                log.trace({error: e}, "Result is not JSON"); // ARIN response not JSON
                return;
            }

            log.debug({body: body}, "Printing out the results of Body ");


            if(_.isArray(body.net.netBlocks.netBlock) == true) {
                // The lookup results returned is an array of lookup objects with the following format
                cb(null, {
                    // Required: This is the entity object passed into the integration doLookup method
                    entity: entityObj,
                    // Required: An object containing everything you want passed to the template
                    data: {
                        // Required: this is the string value that is displayed in the template
                        entity_name: entityObj.value,
                        // Required: These are the tags that are displayed in your template
                        summary: [body.net.orgRef['@name']],
                        // Data that you want to pass back to the notification window details block
                        details: {
                            allData: body,
                            //Organization
                            orgHandle: body.net.orgRef['@handle'],
                            orgName: body.net.orgRef['@name'],
                            orgRef: body.net.orgRef['$'],
                            //Network Details
                            netBlockHandle: body.net.handle['$'],
                            netBlockName: body.net.name['$'],
                            netBlockCIDR: body.net.startAddress['$'] + '/' + body.net.netBlocks.netBlock[0].cidrLength['$'],
                            startAddr: body.net.startAddress['$'],
                            endAddr: body.net.endAddress['$'],
                            netBlockRef: body.net.ref['$'],
                            regDate: body.net.registrationDate['$'],
                            upDate: body.net.updateDate['$'],
                            //Parent Network
                            parentHandle: body.net.parentNetRef['@handle'],
                            parentName: body.net.parentNetRef['@name'],
                            parentRef: body.net.parentNetRef['$']
                        }
                    }
                });
            }else {
                cb(null, {
                    // Required: This is the entity object passed into the integration doLookup method
                    entity: entityObj,
                    // Required: An object containing everything you want passed to the template
                    data: {
                        // Required: this is the string value that is displayed in the template
                        entity_name: entityObj.value,
                        // Required: These are the tags that are displayed in your template
                        summary: [body.net.orgRef['@name']],
                        // Data that you want to pass back to the notification window details block
                        details: {
                            allData: body,
                            //Organization
                            orgHandle: body.net.orgRef['@handle'],
                            orgName: body.net.orgRef['@name'],
                            orgRef: body.net.orgRef['$'],
                            //Network Details
                            netBlockHandle: body.net.handle['$'],
                            netBlockName:  body.net.name['$'],
                            netBlockCIDR: body.net.startAddress['$'] +  '/' + body.net.netBlocks.netBlock.cidrLength['$'],
                            startAddr:  body.net.startAddress['$'],
                            endAddr:  body.net.endAddress['$'],
                            netBlockRef:  body.net.ref['$'],
                            regDate:  body.net.registrationDate['$'],
                            upDate:  body.net.updateDate['$'],
                            //Parent Network
                            parentHandle:  body.net.parentNetRef['@handle'],
                            parentName:  body.net.parentNetRef['@name'],
                            parentRef:  body.net.parentNetRef['$']
                        }
                    }
                });
            }
        });

    }
}

function validateOptions(userOptions, cb) {
    let errors = [];
    //nothig to validate; leaving function for future expantion of integration.
    cb(null, errors);
}

// function that takes the ErrorObject and passes the error message to the notification window
var _createJsonErrorPayload = function (msg, pointer, httpCode, code, title, meta) {
    return {
        errors: [
            _createJsonErrorObject(msg, pointer, httpCode, code, title, meta)
        ]
    }
};

// function that creates the Json object to be passed to the payload
var _createJsonErrorObject = function (msg, pointer, httpCode, code, title, meta) {
    let error = {
        detail: msg,
        status: httpCode.toString(),
        title: title,
        code: 'DT_' + code.toString()
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
    validateOptions: validateOptions
};