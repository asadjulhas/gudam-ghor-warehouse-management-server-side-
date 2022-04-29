const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb')
;


// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.GUDAM_GHOR_DB}:${process.env.GUDAM_GHOR_PASS}@cluster0.whv8p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
  await client.connect();

  const productCollenction = client.db('GudamGhor').collection('product');


 app.get('/product', async (req, res) => {
    const quary = {};
    const cursor = productCollenction.find(quary);
    const products = await cursor.toArray();
    res.send(products)
    console.log(products);
 })



  }
  finally {
// await client.close()
  }

}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Gudam-Ghor server is running');
})

app.listen(port, () => {
 console.log('Gudam Ghor server is open on port', port)
})