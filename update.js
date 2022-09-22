const { MongoClient } = require("mongodb")
require('dotenv').config()

// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("YOUTUBE-CLONE");
    const videos = database.collection("videos");
    const comments = database.collection("comments");

    // create a filter to update all videos with a 'G' rating
    // const filter = {}

    // increment every document matching the filter with 2 more comments
    // const updateDoc = {
    //   $set: {
    //     // channelImageUrl: "https://res.cloudinary.com/ddzi0yh71/image/upload/v1659451715/37ebeceea0c6cbddfdbfdeff1e3da349.jpg"
    //     commentsNumber: 0
    //   }
    // }
    // const result = await videos.updateMany(filter, updateDoc);
    // const result = await comments.deleteMany({})
    // console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);