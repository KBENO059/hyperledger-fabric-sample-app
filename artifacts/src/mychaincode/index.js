var shim = require('fabric-shim');
const util = require('util');


const docType = 'wallet';

var ChainCode = class {

    async Init(stub) {
        console.log("-*-*-*-*-*-*-*-*- Chain code initilization -*-*-*-*-*-*-*-*-*-*-*-*");
        let ret = stub.getFunctionAndParameters()
        console.info(ret);
        return shim.success();
    }

    async Invoke(stub) {
        console.log("-*-*-*-*-*-*- Invoking chain code -*-*-*-*-*-*-*-*-*");
        let ret = stub.getFunctionAndParameters();
        let method = this[ret.fcn]
        if (!method) {
            console.error("No method found with name" + ret.fcn);
            return shim.error("No method found with name" + ret.fcn);
        }
        console.log("Calling method" + ret.fcn);
        try {
            const payload = await method(stub, ret.params, this)
            return shim.success(payload);
        } catch (error) {
            console.log(error);
            return shim.error(error);
        }
    }

    async addUser(stub, args, thisClass) {
        console.log("-*-*-*-*-*-*-*-*-*Add user-*-*-*-*-*-*-*-*", args);
        if (args.length !== 4) {
            throw new Error("no of parameters does not matching required");
        }
        var user = args[0];
        var balance = args[1];
        var mobileNumber = args[2];
        var name = args[3];
        if (!balance || typeof parseFloat(balance) !== 'number') {
            throw new Error("Give a valid balance amount");
        }
        if (!mobileNumber) {
            throw new Error("Mobile number is required")
        }
        if (!name) {
            throw new Error("Name is required")
        }
        const data = {
            balance,
            mobileNumber,
            name,
            docType
        }
        await stub.putState(user, Buffer.from(JSON.stringify(data)));
    }

    async addMoney(stub, args, thisClass) {
        if (args.length && args.length >= 2) {
            const user = args[0];
            const amount = args[1];
            if (!user) {
                throw new Error("usename cannot be empty");
            }
            if (!amount || typeof parseFloat(amount) !== 'number') {
                throw new Error("Give a valid amount ");
            }
            const Avalbytes = await stub.getState(user);
            if (!Avalbytes.toString()) {
                const error = 'Cannot find a account with the username ' + user;
                throw new Error(error);
            }
            try {
                let data = JSON.parse(Avalbytes.toString())
                const currentBalance = data.balance;
                const newBalance = parseFloat(currentBalance) + parseFloat(amount);
                data.balance = newBalance;
                await stub.putState(user, Buffer.from((JSON.stringify(data))));
            } catch (error) {
                throw new Error("Error while parsing the JSON");
            }
        } else {
            throw new Error("Pass required parameters(username,amount)")
        }
    }


    async transferMoney(stub, args) {
        if (args.length && args.length !== 3) {
            throw new Error("Invalid number of parameteres");
        }
        const payer = args[0];
        const payee = args[1];
        const amount = parseFloat(args[2]);
        let payerData = {};
        let payeeData = {};
        const payerDataBytes = await stub.getState(payer);
        if (!payerDataBytes.toString()) {
            const error = 'Cannot find a account with the username ' + payer;
            throw new Error(error);
        }
        const payeeDataBytes = await stub.getState(payee);
        if (!payeeDataBytes.toString()) {
            const error = 'Cannot find a account with the username ' + payee;
            throw new Error(error);
        }
        try {
            payerData = JSON.parse(payerDataBytes.toString());
            payeeData = JSON.parse(payeeDataBytes.toString());
        } catch (error) {
            throw new Error("Error while parsing the JSON")
        }
        if (parseFloat(payerData.balance) < amount) {
            const error = 'Insufficient account balance';
            throw new Error(error);
        }
        try {
            payerData.balance = (parseFloat(payerData.balance) - amount);
            payeeData.balance = (parseFloat(payeeData.balance) + amount);
            await stub.putState(payee, Buffer.from((JSON.stringify(payeeData))));
            await stub.putState(payer, Buffer.from((JSON.stringify(payerData))));
        } catch (error) {
            throw new Error("Error while stringify the JSON")
        }
    }

    async query(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the person to query')
        }

        let jsonResp = {};
        let A = args[0];

        // Get the state from the ledger
        let Avalbytes = await stub.getState(A);
        if (!Avalbytes) {
            jsonResp.error = 'Failed to get state for ' + A;
            throw new Error(JSON.stringify(jsonResp));
        }

        jsonResp = JSON.parse(Avalbytes.toString());
        console.info('Query Response:');
        console.info(jsonResp);
        return Avalbytes;
    }


    async queryByMobileNumber(stub, args, thisClass) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the person to query')
        }
        const mobileNumber = args[0];
        if (!mobileNumber) {
            throw new Error("Mobile number is required");
        }
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = docType;
        queryString.selector.mobileNumber = mobileNumber;
        console.log("###################################QUERY STRING######################################", queryString);
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);
        return queryResults;
    }


    async getQueryResultForQueryString(stub, queryString, thisClass) {
        console.info('- getQueryResultForQueryString queryString:\n' + queryString)
        let resultsIterator;
        try {
            resultsIterator = await stub.getQueryResult(queryString);
        } catch (error) {
            throw new Error("Error in query");
        }
        let method = thisClass['getAllResults'];
        let results = await method(resultsIterator, false);
        return Buffer.from(JSON.stringify(results));
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }
}

shim.start(new ChainCode())