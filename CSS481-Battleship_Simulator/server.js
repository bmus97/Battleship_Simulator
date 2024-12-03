const express = require("express");
const app = express();

app.use(express.json());

// get request for the players ship grid
// in strategy
app.get("/strategy", (req, res) => {});
