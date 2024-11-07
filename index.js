const express = require("express");
const cookieParser = require("cookie-parser");
const database = require("./database.js");
const account = require("./account.js");

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500"); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
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
    var params = req.query;

    console.log(params);

    var data = await database.getData("account-database");

    var status = account.matchAccount(
        data.values,
        params.username,
        params.password
    );

    res.send(status);
});

app.put("/api/register", async (req, res) => {
    var params = req.query;

    console.log(params);

    var key = account.generateKey();

    var data = await database.getData("account-database");

    var status = account.confirmCreate(data.values, params.username, key);
    if (status.status.username) {
        database.putData("account-database!A:C", [
            params.username,
            params.password,
            key,
        ]);
    }
    res.send(status);
});

async function createNode(key, node_name) {
    sheet_name = "history-" + key + "-" + node_name;

    await database.createSheet(sheet_name);
    
    await database.putData(sheet_name + "!A1:F1", [
        "temperature",
        "humidity",
        "humidity soil",
        "dust",
        "light measure",
        "rain measure",
    ]);
}

app.post("/api/node/build", async (req, res) => {
    var params = req.query;

    console.log(params);

    var data = await database.getData("node-name-database");

    console.log(data);

    var status = await account.confirmCreateNode(
        data.values,
        params.node_name,
        params.key
    );

    if (status.status.node_name) {
        database.putData("node-name-database!A:B", [
            params.key,
            params.node_name,
        ]);

        await createNode(params.key, params.node_name);
    }

    console.log(status);

    res.send(status);
});

app.get("/api/node/list", async (req, res) => {
    var params = req.query;

    console.log(params);

    var data = await database.getData("node-name-database");

    console.log(data.values);

    var node_list = account.nodeList(data.values, params.key)
    console.log(node_list);

    res.send(node_list);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
