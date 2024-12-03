const express = require("express");
const app = express();

const port = 8080;
app.use(express.json());

// for game actions when player shoots
app.post("");

// get request for the players ship grid
// in strategy
// note try to send back opponent board
// if can't make a get request with new endpoint
app.post("/strategy", (req, res) => {
  const grid = req.body.grid;

  if (!grid || !Array.isArray(grid) || grid.length === 0) {
    return res.status(400).json({ message: "Invalid grid data" });
  }

  res.status(200).json({ message: "Grid recieved" });
});

app.listen(port);
