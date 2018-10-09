var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
var hfc = require('fabric-client');

var routeConstants = require('../constants/routeConstants');
var appConstants = require('../constants/appConstants');
var loggerUtil = require('../util/logger');
var logger = loggerUtil.getLogger('UserRoute');
var getErrorMessage = require('../util/error').getErrorMessage;
var UserService = require('../services/user')


router.route(routeConstants.USER).post(async function(req, res) {
	var username = req.body.username;
	var orgName = req.body.orgName;
	logger.debug('End point : ' + routeConstants.USER);
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, appConstants.jwtSecret);
	let response = await UserService.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the  username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		res.json(response);
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.json({success: false, message: response});
	}

})

module.exports = router;