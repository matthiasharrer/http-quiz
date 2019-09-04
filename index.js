const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient
const MongoStore = require('connect-mongo')(session);

const mongodburi = process.env.MONGODB_URI;
if(!mongodburi) {
    throw new Error("No env variable with the mongodb uri provided!");
}

async function main() {

    const client = await MongoClient.connect(mongodburi, { useNewUrlParser: true, useUnifiedTopology: true })

    const app = express();
    app.use(session({
        secret: 'eigwhopr;n8uvs3z',
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ client: client })
    }))

    app.get("/", (req, res) => {
        if(req.query.username) {
            res.end(`Nice to meet you ${req.query.username}, but this was not the correct way to do it (and actually a GET and not a POST). Please use an HTTP Client, for example the 'REST Client' Extension for VS Code or Postman and try again.`)
        } else {
            res.end(`<html><head><title>Next steps</title></head><body>
                        Welcome to this short little quiz. To start just post your name.
                        <form action="/" method="get">
                            <input type="text" placeholder="Username" name="username">
                            <input type="submit" value="Submit">
                        </form>
                    </body></html>`);
        }
    });

    app.post("/", bodyParser.text(), (req, res) => {
        if(typeof req.body !== "string") {
            return res.end('Try sending your name in the body. You might need to include this request header "Content-Type: text/plain". This tells me to interpret the name you are sending as plain text.')
        }
        req.session.user = req.body;
        res.location("/next-steps")
            .end(`Hi ${req.body}!\nWhen creating new resources using POST the server usually returns the location of the created resource in the 'Location' Header`);
    });

    app.get("/next-steps", (req, res) => {
        res.send("Hey you've found it! Congratulations. The next step should be that you check out my options.");
    });

    app.options("/next-steps", (req, res) => {
        res.header('Allow', 'GET,DELETE');
        res.send("Look at the 'Allow' response header.");
    });

    app.delete("/next-steps", (req, res) => {
        if(req.headers.authorization === "Bearer 8a5ed8b0b3ed4d698e52ee7d14ed405d") {
            res.send("Oh no .. you've deleted all the steps ... please put your own steps at '/your-steps'");
        } else {
            res.send(`You need to authenticate in order to call this method. This can be done by sending "Bearer 8a5ed8b0b3ed4d698e52ee7d14ed405d" in the "Authorization" Header`);
        }
    });

    app.put("/your-steps", bodyParser.text({type: () => true}), (req, res) => {
        if(req.body === "") {
            res.end(`Come on ${req.session.user || ""} .. you should put SOMETHING`)
        }
        res.end(`Well, that's a nice way to put it: \n\n${req.body}\n\nYou almost made it ${req.session.user}!\nPlease rate the exercise by posting to /rating/stars/<1/2/3/4/5> depending on how you liked it.`);
    });

    app.post("/rating/stars/:number", async (req, res) => {
        const rating = req.params.number;
        if(!rating || rating < 1 || rating > 5) {
            return res.status(400).end("Please rate with 1 to 5 stars")
        }
        if(req.session.rated) {
            return res.end("You can only rate once!");
        }
        await client.db().collection("ratings").insertOne({
            name: req.session.user,
            rating: rating
        });
        req.session.rated = true;
        res.end(`Thanks ${req.session.user} :)`);
    });

    app.get("/all-ratings", async (req, res) => {
        const ratings = await client.db().collection("ratings").find({}).toArray();
        res.json(ratings)
    });

    app.delete("/all-ratings", async (req, res) => {
        await client.db().collection("ratings").drop();
        res.end("Ok..");
    });


    app.delete("/all-sessions", async (req, res) => {
        await client.db().collection("sessions").drop();
        res.end("Ok..");
    });

    app.get("*", (req, res) => {
        res.end("Nice try ...")
    });

    app.listen(process.env.PORT || 80, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
    );
}
main();