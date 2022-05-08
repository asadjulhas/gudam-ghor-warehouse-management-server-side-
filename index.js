const express = require('express');
const app = express();
const cors = require('cors');
var jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();


const { MongoClient, ServerApiVersion } = require('mongodb')
;

// Middleware
app.use(cors());
app.use(express.json());

// Verify user token
function VerifyUser (req, res, next)  {
  const accessToken = req.headers.authorization;
  if(!accessToken){
    return res.status(401).send({Message: 'unauthorized access'})
  }
  const token = accessToken.split(' ')[1];
  jwt.verify(token, process.env.GUDAM_GHOR_JWT, function(err, decoded) {
    if(err) {
      return res.status(403).send({Message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  });
}


const uri = `mongodb+srv://${process.env.GUDAM_GHOR_DB}:${process.env.GUDAM_GHOR_PASS}@cluster0.whv8p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
  await client.connect();

  const productCollenction = client.db('GudamGhor').collection('product');

  // Add product
  app.post('/add-product', async (req, res) => {
    const data = req.body;
    const result = await productCollenction.insertOne(data);
    res.send(result)
  })


  // Get all product count
  app.get('/productcount', async (req, res) => {
    const count = await productCollenction.estimatedDocumentCount();
    res.send({count})
  })

  // Get all the products
 app.get('/product', async (req, res) => {
    const quary = {};
    const cursor = productCollenction.find(quary);
    const products = await cursor.toArray();
    res.send(products)
 })

 // Get all product in pagination
 app.get('/pagination', async (req, res) => {
   const pageNumber = req.query.pageNUmber;
   const pageAmmount = parseInt(req.query.pageAmmount);
   const query = {};
   const cursor = productCollenction.find(query);
   const product = await cursor.skip(pageNumber*pageAmmount).limit(pageAmmount).toArray();
   res.send(product)
 })

 // Get a single item
 app.get('/item', async (req, res) => {
   const id = req.query.id;
   const query = {_id: ObjectId(id)};
   const item = await productCollenction.findOne(query);
   res.send(item)
 })

 // Update product stock
 app.put('/update/:id', async (req, res) => {
   const id = req.params.id;
   const query = {_id: ObjectId(id)}
   const stock = req.body;
   const options = { upsert: true };
   const updateDoc = {
    $set: {
      stock: stock.currentStock
    },
  };
  const result = await productCollenction.updateOne(query, updateDoc, options)
  res.send({result})
 })

 // Delete a product

 app.delete('/delete/:id', async (req, res) => {
   const id = req.params.id;
   const query = {_id: ObjectId(id)}
   const result = await productCollenction.deleteOne(query)
   res.send(result)
 })

 // Get product by user
 app.get('/my-item', VerifyUser, async (req, res) => {
   const email = req.query.email;
   const decodedEmail = req.decoded.email
   console.log('user', email, 'token', decodedEmail)
   if(email === decodedEmail) {
   const query = {email: email};
   const cursor = productCollenction.find(query);
   const items = await cursor.toArray();
   res.send(items)
  }else {
    res.status(403).send({message: 'forbidden access'})
  }
 })

// Create JWT
app.post('/login', async (req, res) => {
  const user = req.body;
  const accessToken = jwt.sign(user, process.env.GUDAM_GHOR_JWT, {
    expiresIn: '1d'
  })
  res.send({accessToken})
})

  }
  finally {
// await client.close()
  }

}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Gudam-Ghor server is running now  `');
})

app.listen(port, () => {
 console.log('Gudam Ghor server is open on port', port)
})