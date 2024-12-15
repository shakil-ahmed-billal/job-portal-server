const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldsdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobCollection = client.db("job-portal").collection("jobs");
    const jobApplication = client.db("job-portal").collection("application");

    // read all job api section
    app.get("/jobs", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // read jobs details section api
    app.get("/job/:id" , async(req , res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const cursor = await jobCollection.find(query).toArray();
      res.send(cursor)
    })
    // my application view section api
    app.get('/my-application/:email' , async(req , res)=>{
      const email = req.params.email;
      const cursor = {applicant_email: email}
      const result = await jobApplication.find(cursor).toArray()
      res.send(result)
    })
    // create a new job api section
    app.post("/jobs", async (req, res) => {
      const data = req.body;
      const result = await jobCollection.insertOne(data);
      res.send(result);
    });

    // create user application api
    app.post("/job-application", async (req, res) => {
      const data = req.body;
      const result = await jobApplication.insertOne(data);
      res.send(result);
      console.log(data);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server id running");
});
app.listen(port, () => {
  console.log("server id running");
});
