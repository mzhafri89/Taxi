const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 5000;

app.get("/api/taxis", async (req, res) => {
  const latitude = req.query?.latitude ?? "1.285194";
  const longitude = req.query?.longitude ?? "103.8522982";

  try {
    const response = await fetch(
      `https://qa-interview-test.splytech.dev/api/drivers?latitude=${latitude}&longitude=${longitude}`
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
