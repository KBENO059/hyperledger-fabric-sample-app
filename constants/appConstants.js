module.exports = {
    jwtSecret: 'SMP@144_~qez',
    org1: { //Keyvalue store configuration for Org1
        couchDbOpt: {
            name: 'org1',
            url: 'http://127.0.0.1:5984'
        }
    },
    org2: { //Keyvalue store configuration for Org2
        couchDbOpt: {
            name: 'org2',
            url: 'http://127.0.0.1:5984'
        }
    }
}