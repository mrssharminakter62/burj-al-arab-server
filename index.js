const express = require('express')

const bodyParser = require('body-parser');
const cors = require('cors');

const  admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `ongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9e8bh.mongodb.net/burjAlArab?retWryrites=true&w=majoritym`;

const port = 5000

const app = express()

app.use(cors());
app.use(express.json());


var serviceAccount = require("./configs/buruj-al-arabia-dfb86-firebase-adminsdk-r61ty-a889a8d41e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result =>{
      res.send(result.insertedCount > 0)
    })
    console.log(newBooking);
})

app.get('/bookings', (req, res) => {
  //  console.log(req.query.email)
  const bearer = req.headers.authorization;
 if(bearer && bearer.startsWith('Bearer')){
   const idToken = bearer.split(' ')[1];
   admin.auth().verifyIdToken(idToken)
   .then((decodedToken) => {
     const tokenEmail = decodedToken.email;
     const queryEmail = req.query.email; 

     if(tokenEmail == queryEmail){
      bookings.find({email: queryEmail})
      .toArray((err, documents)=>{
        res.status(200).send(documents);
      })
      
     }
     else{
      res.status(401).send('un-authorized access');
     }
   })
   .catch((error) => {
    res.status(401).send('un-authorized access');
   });
}
else{
  res.status(401).send('un-authorized access');
}

 
  bookings.find({email: req.query.email})
  .toArray((err, documents)=>{
    res.send(documents);
  })
  
})

});
app.listen(port, () =>console.log("Hello"))