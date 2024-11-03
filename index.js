const express = require("express");
const cookieParser = require("cookie-parser");
// const cors = require("cors");
const database = require("./database.js");
const account = require("./account.js");

const app = express();

// const corsOptions = {
//     origin: "*",
//     credentials: true,
// };

// app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

app.use(cookieParser());

app.use(express.json());

app.get("/api", (req, res) => {
    res.send("Server is online...");
});

app.get("/api/login", async (req, res) => {
    var body = req.body;

    var data = await database.getData("account-database");

    var status = account.matchAccount(
        data.values,
        body.username,
        body.password
    );

    res.cookie("key", status.key);
    res.send(status);
});

app.put("/api/register", async (req, res) => {
    var body = req.body;

    var key = account.generateKey();

    var data = await database.getData("account-database");

    var status = account.confirmCreate(data.values, body.username, key);
    if (status.status.username) {
        database.putData("account-database!A:C", [
            body.username,
            body.password,
            key,
        ]);
    }

    res.cookie("key", key);
    res.send(status);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
