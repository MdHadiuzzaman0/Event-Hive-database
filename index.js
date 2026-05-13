require('dotenv').config();
const express = require('express')
const app = express()
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Event_Hive_52");
    const eventCollection = database.collection("events");
    app.get('/events', async (req, res) => {
      const result = await eventCollection.find().toArray()
      res.json(result)
    })

    app.get("/events/:id", async(req, res) => {
      const id = req.params.id;
      const idBSON = { _id: new ObjectId(id) }
      const result = await eventCollection.findOne(idBSON)
      res.json(result)
    }) 

    app.post("/events", async(req, res) => {
      const newEvent = req.body;
      const result = await eventCollection.insertOne(newEvent)
      console.log(newEvent)
      res.json(result)
    })

    app.delete("/events/:id", async(req, res) => {
      const id = req.params.id
      const idBSON = { _id: new ObjectId(id)}
      const result = await eventCollection.deleteOne(idBSON)
      res.json(result)
    })

    app.patch('/events/:id', async (req, res) => {
      const getId = req.params.id
      const findId = {_id: new ObjectId(getId)}
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
      // const {title, location, category, duration, price, date, image, description, organizer, participants} 
      const result = await eventCollection.updateOne(findId, modifiedData)
      res.json(result)
    })

    await client.db("admin").command({ ping: 1 });
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
