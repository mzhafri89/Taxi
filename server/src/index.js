const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 5000;

app.get("/api/taxis", async (req, res) => {
  const latitude = req.query?.latitude ?? "1.285194"; //TODO: Default location should be inside .env
  const longitude = req.query?.longitude ?? "103.8522982";
  const count = req.query?.count ?? 10;

  try {
    const response = await fetch(
      `https://qa-interview-test.splytech.dev/api/drivers?latitude=${latitude}&longitude=${longitude}&count=${count}`
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
