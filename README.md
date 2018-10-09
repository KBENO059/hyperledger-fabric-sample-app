## Hyperledger fabric sample app using Node.js SDK APIs

A sample Node.js app to demonstrate 
* fabric-client 
* fabric-ca-client 
* CouchDB as state database
* Kafka based ordering service
* CouchDB as keyValueStore and cryptoStore 

### Prerequisites and setup:

* [Docker](https://www.docker.com/products/overview) - v1.12 or higher
* [Docker Compose](https://docs.docker.com/compose/overview/) - v1.8 or higher
* [Git client](https://git-scm.com/downloads) - needed for clone commands
* **Node.js** v8.4.0 or higher
* [Download Docker images](http://hyperledger-fabric.readthedocs.io/en/latest/samples.html#binaries)
* **CouchDb** v2.0 or higher 
* [pm2](https://www.npmjs.com/package/pm2)

#### Artifacts
* Crypto material has been generated using the **cryptogen** tool from Hyperledger Fabric and mounted to all peers, the orderering node and CA containers. More details regarding the cryptogen tool are available [here](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html#crypto-generator).
* An Orderer genesis block (genesis.block) and channel configuration transaction (mychannel.tx) has been pre generated using the **configtxgen** tool from Hyperledger Fabric and placed within the artifacts folder. More details regarding the configtxgen tool are available [here]( ).
* If you want to update network you can find the configuration under artifacts/network-config.yaml for the SDK
* If you regenerate the certificates same should be updated in docker-compose and network-config 
* Update the couchDB options in the constants/appConstants.js to use different couchDB port for the KeyValueStore and cryptoStore

## Running the sample program

###### Terminal Window 1

``
./runApp.sh
``

* This lauches the required network on your local machine
* Installs the fabric-client and fabric-ca-client node modules
* And, starts the node app on PORT 4000

Now server is ready to accept requests 
you can find a postman collection under resources folder where all the API requests are documented.