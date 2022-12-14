const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aqlapfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const serviceCollection = client.db('ctm').collection('services');
        const reviewCollection = client.db('ctm').collection('reviews')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
            res.send({ token })
        });


        // services api
        app.get('/', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ time: -1 });
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ time: -1 });
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // reviews api
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = await reviewCollection.find(query).sort({ time: -1 });
            const review = await cursor.toArray();
            res.send(review);
        });

        app.post('/reviews', async (req, res) => {
            const user = req.body;
            const result = await reviewCollection.insertOne(user);
            res.send(result);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: id };
            const result = reviewCollection.find(query).sort({ time: -1 });
            const cursor = await result.toArray();
            res.send(cursor);
        });

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });


        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) }

            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        });
    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('capture the moment is running');
});

app.listen(port, () => {
    console.log(`capture the moment running on port: , ${port}`);
})