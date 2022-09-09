const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { response } = require('express');
require('dotenv').config();
const app = express();


const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jekula.lv2vhda.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }); 


//jwt verify
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}





async function run(){

    try{
        await client.connect();
        const productCollection = client.db('product').collection('product-collection')
        const savedOrderCollection = client.db('product').collection('order-saved')
        const partsCollection = client.db('product').collection('parts')
        const userCollection = client.db('product').collection('users')

  



//varify Admin

// const verifyAdmin = async (req, res, next) => {
//   const requester = req.decoded.email;
//   const requesterAccount = await userCollection.findOne({ email: requester });
//   if (requesterAccount.role === 'admin') {
//     next();
//   }
//   else {
//     res.status(403).send({ message: 'forbidden' });
//   }
// }





  //Admin
  app.put('/user/admin/:email', verifyJWT , async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const updateDoc = {
      $set: { role: 'admin' },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
  })










//Order Data   

   
        app.get('/order', verifyJWT, async (req, res) => {
          const user = req.query.user;
          const decodedEmail = req.decoded.email;
          if (user === decodedEmail) {
            const query = { user: user };
            const save = await productCollection.find(query).toArray();
            return res.send(save);
          }
          else {
            return res.status(403).send({ message: 'forbidden access' });
          }
        })


//All user Data   

   
app.get('/user', verifyJWT, async (req, res) => {
  const users = await userCollection.find().toArray();
  res.send(users);
});

//Saved Data

        app.get('/saved', verifyJWT, async (req, res) => {
          const user = req.query.user;
          const decodedEmail = req.decoded.email;
          if (user === decodedEmail) {
            const query = { user: user };
            const save = await savedOrderCollection.find(query).toArray();
            return res.send(save);
          }
          else {
            return res.status(403).send({ message: 'forbidden access' });
          }
        })









        app.get('/user',  async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const product = await cursor.toArray();
            res.send(product);
        });


//Add User
app.put('/user/:email', async(req, res) => {
const email = req.params.email;
const user = req.body;
const filter = {email: email};
const options = { upsert: true};
const updateDoc = {
  $set: user,
};
const result = await userCollection.updateOne(filter, updateDoc, options);
const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
res.send({result, token});


})






        //get data for saved order
        app.get('/saved', async (req, res) => {
          const query = {};
          const cursor = savedOrderCollection.find(query);
          const mobiles = await cursor.toArray();
          res.send(mobiles);
      })

      //Admin get Product
        
      app.get('/saved', async(req, res) => {
        const email = req.query.email;
        console.log(email);
          const query = {user: email};
          const cursor = savedOrderCollection.find(query);
          const data  = await cursor.toArray();
         res.send(data);
      })


        app.get('/parts', async (req, res) => {
          const query = {};
          const cursor = partsCollection.find(query);
          const mobiles = await cursor.toArray();
          res.send(mobiles);
      })

      //add Product 
      app.post('/partAdded', async( req, res) => {
        const part = req.body;
       const query = {part: part.parts, product: part.product}  //cannot take same service several time
       const exists = await partsCollection.findOne(query)
       if(exists){
         return res.send({success: false, part: exists})
       }
       const result = await partsCollection.insertOne(part);
        return res.send({success: true, result});
        })


        








        app.post("/order", async(req, res) => {
          const order = req.body;
          const result = await productCollection.insertOne(order);
          res.send({success: true,  result});
        })


        app.post("/saved", async(req, res) => {
          const saved = req.body;
          const result = await savedOrderCollection.insertOne(saved);
          res.send({success: true,  result});
        })
        
        //Delete Product
      


       //update the services
     



    }





finally{

}

}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`JEKULA app listening on port ${port}`)
})