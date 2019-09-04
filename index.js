const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.get("/", (req, res) => {
    res.end(`<html><head><title>Next steps</title></head><body>
                Welcome to this short little quiz. To start just post your name.
                <form action="/wrong-post" method="get">
                    <input type="text" placeholder="Username" name="username">
                    <input type="submit" value="Submit">
                </form>
            </body></html>`)
});

app.get("/wrong-post", (req, res) => {
    if(!req.query.username) {
        return res.status(400).end();
    }

    res.end(`Nice to meet you ${req.query.username}, but this was not the correct way to do it (and actually a GET and not a POST). Please use an HTTP Client, for example the 'REST Client' Extension for VS Code or Postman and try again.`)
})

app.post("/", bodyParser.text(), (req, res) => {
    var nextStepsUrl = 'https://' + req.get('host') + path.join(req.originalUrl, "next-steps");
    res.location(nextStepsUrl)
       .end(`Hi ${req.body}!\nWhen creating new resources using POST the server usually returns the location of the created resource in the 'Location' Header`);
});

app.get("/next-steps", (req, res) => {
    res.send("Hey you've found it! Congratulations. The next step should be that you check out my options.");
});

app.options("/next-steps", (req, res) => {
    res.header('Allow', 'GET,DELETE');
    res.send("Look at the allow response header.");
});

app.delete("/next-steps", (req, res) => {
    if(req.headers.authorization === "Bearer 8a5ed8b0b3ed4d698e52ee7d14ed405d") {
        res.send("Oh no .. all the steps are gone now.")
    } else {
        res.send(`You need to authenticate in order to call this method. This can be done by sending "Bearer 8a5ed8b0b3ed4d698e52ee7d14ed405d" in the "Authorization" Header`);
    }
});

app.get("*", (req, res) => {
    res.end("Nice try ...")
});

app.listen(process.env.PORT || 80, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);