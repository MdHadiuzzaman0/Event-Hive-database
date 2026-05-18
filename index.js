require('dotenv').config();
const express = require('express')
const app = express()
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
const port = process.env.PORT;
import { jwtVerify, createRemoteJWKSet } from 'jose'

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization
  console.log(authHeader)
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized" })
  }
  const token = authHeader.split(" ")[1]
  if (!token) {
    res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload)
    next()
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" })
  }
  // next()
  // if(header === "logged in"){
  //   next()
  // }
  // else{
  //   res.status(401).json({message: "Unauthorized"})
  // }
}

async function run() {
  try {
    // await client.connect();
    const database = client.db("Event_Hive_52");
    const eventCollection = database.collection("events");
    const bookingCollection = database.collection("bookings");

    app.get('/events', async (req, res) => {
      const result = await eventCollection.find().toArray()
      res.json(result)
    })

    app.get("/events/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const idBSON = { _id: new ObjectId(id) }
      const result = await eventCollection.findOne(idBSON)
      res.json(result)
    })

    app.post("/events", async (req, res) => {
      const newEvent = req.body;
      const result = await eventCollection.insertOne(newEvent)
      // console.log(newEvent)
      res.json(result)
    })

    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id
      const idBSON = { _id: new ObjectId(id) }
      const result = await eventCollection.deleteOne(idBSON)
      res.json(result)
    })

    app.patch('/events/:id', async (req, res) => {
      const getId = req.params.id
      const findId = { _id: new ObjectId(getId) }
      const { title, location, category, duration, price, date, image, description, organizer, participants } = req.body;

      const modifiedData = {
        $set: {
          title: title,
          location: location,
          category: category,
          duration: duration,
          price: price,
          date: date,
          image: image,
          description: description,
          organizer: organizer,
          participants: participants
        }
      };
      console.log(modifiedData)
      const result = await eventCollection.updateOne(findId, modifiedData)
      res.json(result)
    })

    app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      console.log(bookingData)
      const result = await bookingCollection.insertOne(bookingData)
      res.json(result)
    })

    app.get("/booking/:userId", verifyToken, async (req, res) => {
      console.log(req.params)
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId: userId }).toArray()
      // const result = await bookingCollection.find({userId}).toArray()  //same resulit dibe
      res.json(result)
    })

    app.delete("/booking/:bookingId", async (req, res) => {
      // console.log("params", params)
      const { bookingId } = req.params;
      const result = await bookingCollection.deleteOne({ _id: new ObjectId(bookingId) })
      res.json(result)
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
