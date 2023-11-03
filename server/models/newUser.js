const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://jxp100:betterment@cluster0.hhplklu.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

async function addUser(newUser) {
    try {
        const usersCollection = client.db("users").collection("people");
        const result = await usersCollection.insertOne(newUser);
        return result;
    } catch (error) {
        console.error("Error adding user to MongoDB:", error);
        throw error;
    }
}

module.exports = {
    connectToMongoDB,
    addUser,
};