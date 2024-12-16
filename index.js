const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// custom
const logger = (req, res, next) => {
  console.log("inside the logger");
  next();
};
const verify = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log("cookies", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorize access" });
    }
    req.user = decoded;
    next();
  });
};

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

    // user verify section
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false, //production set true ....
        })
        .send({ success: true });
    });

    // read all job api section
    app.get("/jobs", async (req, res) => {
      console.log("new inside api callback");
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // read jobs details section api
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await jobCollection.find(query).toArray();
      res.send(cursor);
    });
    // my application view section api
    app.get("/my-application/:email", verify, async (req, res) => {
      const email = req.params.email;
      const cursor = { applicant_email: email };
      const result = await jobApplication.find(cursor).toArray();

      if (req.user?.email !== email) {
        return res.status(403).send({ message: "email not match" });
      }
      console.log("cookies", req.cookies);

      // not a good way for this
      for (const application of result) {
        const query1 = { _id: new ObjectId(application.jobId) };
        const job = await jobCollection.findOne(query1);
        if (job) {
          application.title = job.title;
          application.location = job.location;
          application.company_logo = job.company_logo;
          application.company = job.company;
        }
      }
      res.send(result);
    });
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
