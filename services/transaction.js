'use strict';

var util = require('util');

var loggerUtil = require('../util/logger');
var logger = loggerUtil.getLogger('InvokeService');
var userService = require('../services/user');


var getTransactionByID = async function (peer, channelName, trxnID, username, org_name) {
    try {
        // first setup the client for this org
        var client = await userService.getClientForOrg(org_name, username);
        logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
        var channel = client.getChannel(channelName);
        if (!channel) {
            let message = util.format('Channel %s was not defined in the connection profile', channelName);
            logger.error(message);
            throw new Error(message);
        }

        let response_payload = await channel.queryTransaction(trxnID, peer);
        if (response_payload) {
            logger.debug(response_payload);
            return response_payload;
        } else {
            logger.error('response_payload is null');
            return 'response_payload is null';
        }
    } catch (error) {
        logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
        return error.toString();
    }
};


exports.getTransactionByID = getTransactionByID;