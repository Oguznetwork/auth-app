const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use(express.json()); // JSON verisini alır

app.use(
  session({
    secret: "gizliAnahtar",
    resave: false,
    saveUninitialized: true,
  })
);

// Statik dosyalar için
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "views")));

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
