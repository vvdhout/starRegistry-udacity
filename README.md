# Private Blockchain for Udacity's Nanodegree - Star Notarization Service

In this folder you will find all the files and modules needed to initialize and operate the star notarization service that I have build during the Udacity Nanodegree. We started by creating a blockchain that did not persist its data, just to build out some functionality. After this, we integrated levelDB into the system in order to save and persist the chain of data. Lastly, we built a Web API that allows users to register stars on the private blockchain. This functionality will be elaborated on below. 

### Feedback is always welcome

I am relatively new to the operations of NodeJS and have only recently started working with Promises and Async/Await syntax. Thus, if you see any room for improvement or have any suggestions to build out more funtionality, I would love to hear from you. I am looking to grow as a developer be it node or blockchain, and would love to connect with others that are working in this incredible field as well.
Note: This version of the star registration service is rather messy. I will take the time at one point to rewrite it and make it more organized and slim.

## Getting Started

Below you can find instructions to set up and operate the blockchain, after which we'll present the functionality for the star notarization process.

### Pre-requisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install express with --save flag
```
npm install express --save
```
- Install body-parser with --save flag
```
npm install body-parser --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```

## Testing

You can test the blockchain code by following these steps:

1: Open a command prompt or shell terminal after install node.js.

2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session

4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```


## Web API

The blockchain can now be interacted with via our web API. Here, the user will be able to request access for star notarization, verify their blockchain ID/address ownership by signing a message, register a star on the blockchain with a story, and request star data by block height, hash, and blockchain ID.

Initialize and run the server:

```
node asyncChain.js
```

Interacting with the star notarization service.

#### Using a software like Postman or a CURL

Baseurl: http://localhost:8000

- POST (adding a blockchain address to the '_address' parameter/key that the user wants to use to notarize a star.)

```
curl -X "POST" "http://localhost:8000/requestValidation/" -H 'Content-Type: application/json' -d $'{"_address":"ThISiSaFaKEADdreSs123345566"}'
```

This returns a JSON object with a message that can signed using the blockchain address. This way we can verify ownership of the address.
Once a message signature has been generated by the user, the address can be verified by sending a post request as follows:

- POST (adding a blockchain address to the '_address' parameter/key and a signature to the '_signature' key.)

```
curl -X "POST" "http://localhost:8000/message-signature/validate/" -H 'Content-Type: application/json' -d $'{"_address":"ThISiSaFaKEADdreSs123345566",
"_signature": "thisisafakesignature22233324"}'
```

If verification of the address has been succesful, the user can now notarize a star:

- POST (adding a blockchain address to the '_address' parameter/key, Right Ascension coordinates to the 'ra' key, Declination coordinates to the 'dec' key, and a custom story (< 500 bytes) to the 'story' key.)

```
curl -X "POST" "http://localhost:8000/block/" -H 'Content-Type: application/json' -d $'{"_address":"ThISiSaFaKEADdreSs123345566",
"ra": "26",
"dec": "35",
"story": "The user can add a strory here that is < 500 bytes in length."}'
```

Users can also query star and block data as follows (using a service like Postman or by navigation to the localhost url).

- GET request (replacing [height] with an actual block height (integer/number))
/stars/height/[height]. E.g.:

```
curl http://localhost:8000/stars/height:2

```

- GET request (replacing [hash] with an actual block hash )
/stars/hash/[hash]. E.g.:

```
curl http://localhost:8000/stars/hash:thisISaFakeHASh123123323

```

- GET request (replacing [address] with an address that has a registered star)
/stars/address/[address]. E.g.:

```
curl http://localhost:8000/stars/address:ThISiSaFaKEADdreSs123345566

```