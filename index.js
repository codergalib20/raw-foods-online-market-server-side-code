const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 5000;

// Middleware___
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Connect with server___
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpacy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Start data collection___

async function run() {
  try {
    await client.connect();
    const database = client.db("rawOnlineMarket");
    const foodCollection = database.collection("foods");
    const addToCartCollection = database.collection("addToCart");
    const allUsersCollections = database.collection("allUsers");
    const usersReviewCollection = database.collection("usersReview");

    app.get("/foods", async (req, res) => {
      const cursor = foodCollection.find({});
      const foods = await cursor.toArray();
      res.send(foods);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const food = await foodCollection.findOne(query);
      res.send(food);
    });
    app.post("/cart", async (req, res) => {
      const order = req.body;
      const result = await addToCartCollection.insertOne(order);
      res.json(result);
    });
    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      const role = req.query.role;
      const query = { email: email, role: role };
      const cursor = addToCartCollection.find(query);
      const foods = await cursor.toArray();
      res.send(foods);
    });
    app.get("/cart/orders", async (req, res) => {
      const role = req.query.role;
      const query = {role: role };
      const cursor = addToCartCollection.find(query);
      const foods = await cursor.toArray();
      res.send(foods);
    });
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await addToCartCollection.deleteOne(query);
      res.json(result);
    });
    app.delete('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.json(result);
      });
    app.post("/users", async (req, res) => {
      const order = req.body;
      const result = await allUsersCollections.insertOne(order);
      res.json(result);
    });
    app.post("/review", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const message = req.body.message;
      const date = req.body.date;
      const rating = req.body.rating;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const review = {
        name,
        email,
        message,
        date,
        rating,
        image: imageBuffer,
      };
      const result = await usersReviewCollection.insertOne(review);
      res.json(result);
      console.log(result);
    });
    app.get("/review", async (req, res) => {
      const cursor = usersReviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get("/users", async (req, res) => {
      const cursor = allUsersCollections.find({});
      const foods = await cursor.toArray();
      res.send(foods);
    });
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allUsersCollections.deleteOne(query);
      res.json(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await allUsersCollections.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.get("/admins", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const cursor = allUsersCollections.find(query);
      const foods = await cursor.toArray();
      res.send(foods);
    });
    app.put("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          role: "completed",
        }
      };
      const result = await addToCartCollection.updateOne(query, updateDoc, option);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await allUsersCollections.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Start footer part of code here___
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () =>
  console.log(`Listening on port ${port} my raw market food website`)
);
