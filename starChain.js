const chainExport = require('./blockchain.js');
const Blockchain = chainExport.blockchain;
const Block = chainExport.block;
const chain = new Blockchain();

const level = require('level');
const starDB = './starDB';
const dbS = level(starDB, {valueEncoding: 'json'})

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const bitcoinMessage = require('bitcoinjs-message')

// chain.addBlock(new Block('Test: data here.'));

// chain.validateBlock(2);

// chain.deleteBlock(0);

// let clearChain = async () => {
//  let height = await chain.getHeight();
//  for (let i = 0; i < height + 1; i++) {
//    chain.deleteBlock(i);
//  }
// };
// clearChain();

// chain.validateChain();


const starRequest = (address) => {
  return new Promise( async (resolve, reject) => {
    await dbS.get(address, function(err, value) {
      if(err) {
        console.log('Woops. Have an error requesting the data.')
        resolve(err);
      }
      else {
          resolve(value);
      }
    });
  })
}

app.listen(8000, () => {
  console.log('App is listening on port 8000');
})

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));

// Setting the views folder to call files from
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Calling the home.ejs file from the views folder when on / 
app.get('/', (req, res) => { 
  res.render('home');
});

app.get('/block/:height', async (req, res) => {
  let height = req.params.height;
  let chainHeight = await chain.getHeight();

  if(height > chainHeight) {
    res.send(`That block does not yet exists. Currently, the blockchain has a height of ${chainHeight}. Try something in a lower range.`);
  }
  else {
    try {
      let value = await chain.getBlock(height);
      res.send(value);
    }
    catch (error) {
      console.log('We got an error back.')
      res.send('An error occured when querying the block data.')
    }
  }
})


// ============ Star Project Starts Here ==========

app.post('/requestValidation/', (req, res) => {
  if (req.body._address === '' || req.body._address === undefined) {
    res.status(400).json({
      "status": 400,
      message: "Fill the body parameter with your wallet address."
    })
  }
  else {
      const address = req.body._address;
      const requestTimeStamp = new Date().getTime().toString().slice(0,-3);
      const validationWindow = 300;
      const message = `${address}:${requestTimeStamp}:starRegistry`;
      const validationData = {
        address,
        message,
        requestTimeStamp,
        validationWindowInMin
      }
      dbS.put(address, validationData, function(err) {
        if(err) {
          console.log(`We were unable to create a requestBlock for the address ${address} because we experienced a PUT error.`)
        }
        else {
          res.send(validationData);
        }
      })
    }
});

app.post('/message-signature/validate/', async (req, res) => {
  if (req.body._address === '' || req.body._address === undefined || req.body._signature === '' || req.body._signature === undefined) {
    res.status(400).json({
      "status": 400,
      message: "Fill the body parameter with your wallet address and message signature."
    })
  }
  else {
        let address = req.body._address;
        let signature = req.body._signature;
        let starRequestValue = await validate.starRequest(address);
        if(starRequestValue.registerStar) {
          res.send('This address has already been validated.');
        }
        else {
          let message = starRequestValue.message;
          let timeNow = new Date().getTime().toString().slice(0,-3);
          let timeRequest = starRequestValue.requestTimeStamp;
          let validWindow = starRequestValue.validationWindowInMin;
          let timeDif = timeNow - (timeRequest + (validWindow));
          if(timeDif > 0) {
            res.send('Unforunately, the time period in which you were able to verify you address has passed. You can start a new request if you please.')
          }
          else {
            if(!bitcoinMessage.verify(message, address, signature)) {
              res.send('Unforunately, it seems that the signature and address combination is not able to validate the message.')
            }
            else {
              let validRegistar = {
                    registerStar: true,
                    status: {
                      address,
                      timeRequest,
                      message,
                      validationWindow: validWindow,
                      messageSignature: "valid"
                    }
              }
              dbS.put(address, validRegistar, function(err) {
                if(err) {
                  console.log(`Even though the signature was valid for address:${address}, we experience a PUT error and were not able to add the address to the database.`)
                }
                else {
                  res.send(validRegistar);
                }
              })
            }
          }
        }
    }
});


app.post('/block/', async (req, res) => {
  let r = req.body;
  if (r._address === '' || r._address === undefined || 
    !r.dec|| typeof r.dec !== 'string' ||
    !r.ra || typeof r.ra !== 'string' ||
    !r.story || typeof r.story !== 'string' || new Buffer(story).length > 500) {
    res.send('Sorry, we experienced an error. Make sure that the data for all fields are strings and are not empty. Check the README.md for the endpoint documentation')
  }
  else {
    let value = await starRequest(r._address);
    if(!value.registerStar) {
      res.send('Sorry, but this address has yet to been validated. Make sure you validate the address first by []')
    }
    else {
      let starData = {
        address: r._address,
        star: {
          ra: r.ra,
          dec: r.dec,
          story:  new Buffer(r.story).toString('hex')
        }
      }
      let success = await chain.addBlock(new Block(starData))
      if(success) {
      res.send(success)
      }
      else {
        res.send('We were not able to add the block before requesting the return...')
      }
    }
  }
})

app.get('/stars/address/:address', async (req, res) => {
  let address = req.params.address;
  let value = await chain.getStarWithAddress(address);
  res.send(value);
})

app.get('/stars/hash/:hash', async (req, res) => {
  let hash = req.params.hash;
  let value = await chain.getStarWithHash(hash);
  res.send(value);
})

app.get('/stars/height/:height', async (req, res) => {
  let height = req.params.height;
  let value = await chain.getBlock(height);
  res.send(value);
})