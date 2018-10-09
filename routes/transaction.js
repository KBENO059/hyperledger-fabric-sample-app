
var express = require('express');
var router = express.Router();

var routeConstants = require('../constants/routeConstants');
var loggerUtil = require('../util/logger');
var logger = loggerUtil.getLogger('InvokeRoute');
var getErrorMessage = require('../util/error').getErrorMessage;

var authService = require('../services/auth');
var transactionService = require('../services/transaction');

 

router.route(routeConstants.TRANSACTION).get(authService.verify,async function(req, res) {
	logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let trxnId = req.params.trxnId;
	let peer = req.query.peer;
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	let message = await transactionService.getTransactionByID(peer, req.params.channelName, trxnId, req.username, req.orgname);
	res.send(message);
})


module.exports = router;