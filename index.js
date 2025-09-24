const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lci5wie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let workSheetCollection;

async function run() {
  await client.connect();
  const db = client.db("workSheetDB");
  workSheetCollection = db.collection("workSheetData");
}
run().catch(console.dir);

// --- Routes ---
// Root
app.get("/", (req, res) => {
  res.send("Emplify Server is Running");
});
// WorkSheets Related API
// Get all worksheets (optional date filter)
app.get("/worksheet", async (req, res) => {
  const { date } = req.query;
  let query = {};

  if (date) {
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.date = { $gte: selectedDate, $lt: nextDay };
  }

  const worksheets = await workSheetCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  res.json(worksheets);
});

// Add new worksheet
app.post("/worksheet", async (req, res) => {
  const { task, hours, date } = req.body;
  const worksheet = {
    task,
    hours: Number(hours),
    date: new Date(date),
    createdAt: new Date(),
  };
  const result = await workSheetCollection.insertOne(worksheet);
  res.status(201).json({ _id: result.insertedId, ...worksheet });
});

// Update worksheet
app.put("/worksheet/:id", async (req, res) => {
  const { id } = req.params;
  const { task, hours, date } = req.body;

  const worksheet = await workSheetCollection.findOne({
    _id: new ObjectId(id),
  });
  if (!worksheet) return res.status(404).json({ message: "Not found" });

  await workSheetCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { task, hours: Number(hours), date: new Date(date) } }
  );

  const updated = await workSheetCollection.findOne({ _id: new ObjectId(id) });
  res.json(updated);
});

// Delete worksheet
app.delete("/worksheet/:id", async (req, res) => {
  const { id } = req.params;

  const worksheet = await workSheetCollection.findOne({
    _id: new ObjectId(id),
  });
  if (!worksheet) return res.status(404).json({ message: "Not found" });

  await workSheetCollection.deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "Deleted" });
});

// Start server
app.listen(port, () => {
  console.log(`Emplify Server running on port ${port}`);
});
