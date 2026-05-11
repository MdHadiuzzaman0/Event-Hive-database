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
