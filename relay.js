// relay.js (Run this on your VPS)
// Install dependencies: npm install express cors axios dotenv
import express from 'express';
import axios from 'axios';
const app = express();

app.use(express.json());

// Security: Only allow requests with your secret token
const RELAY_SECRET = "hello-world";

app.all('/relay', async (req, res) => {
    const authHeader = req.headers['x-relay-auth'];
    
    if (authHeader !== RELAY_SECRET) {
        return res.status(401).json({ error: "Unauthorized Relay Access" });
    }

    const targetUrl = req.query.url;
    const cocToken = req.headers['authorization']; // The CoC JWT

    if (!targetUrl) {
        return res.status(400).json({ error: "Missing target URL" });
    }

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: {
                'Authorization': cocToken,
                'Accept': 'application/json'
            },
            data: req.body,
            validateStatus: () => true // Don't throw on 4xx/5xx
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Relay running on port 3000'));
