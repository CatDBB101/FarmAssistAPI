const express = require("express");
const cookieParser = require("cookie-parser");
const database = require("./database.js");
const account = require("./account.js");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));

app.use(cookieParser());

app.use(express.json());

app.get("/api", (req, res) => {
    console.log("GET - /api");
    res.send("Server is online...");
});

app.get("/api/login", async (req, res) => {
    console.log("GET - /api/login");

    var params = req.query;
    console.log(params);

    var data = await database.getData("account-database");

    var status = account.matchAccount(
        data.values,
        params.username,
        params.password
    );
    console.log(status);

    res.send(status);
});

app.put("/api/register", async (req, res) => {
    console.log("PUT - /api/register");

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
    console.log(status);

    res.send(status);
});

async function createNode(key, node_name) {
    sheet_name = "history-" + key + "-" + node_name;

    await database.createSheet(sheet_name);

    await database.putData(sheet_name + "!A1:G1", [
        "date",
        "temperature",
        "humidity",
        "humidity soil",
        "dust",
        "light measure",
        "rain measure",
    ]);
    console.log("Node Created.");
}

app.post("/api/node/build", async (req, res) => {
    console.log("POST - /api/node/build");

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
    console.log("GET - /api/node/list");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");
    console.log(data.values);

    var node_list = account.nodeList(data.values, params.key);
    console.log(node_list);

    res.send(node_list);
});

re_data = ["date", "temp", "humi", "soil_humi", "dust", "light", "rain"];

app.put("/api/node/data", async (req, res) => {
    console.log("PUT - /api/node/data");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");
    console.log(data.values);

    var status = account.confirmNode(data.values, params.node_name, params.key);
    console.log(status);

    if (status.status.found) {
        var adding_data = [];
        re_data.forEach((_data) => {
            adding_data.push(params[_data]);
        });
        sheet_name = "history-" + params.key + "-" + params.node_name;
        selector = "!A:G";
        database.putData(sheet_name + selector, adding_data);
    }

    res.send(status);
});

app.get("/api/node/data/last", async (req, res) => {
    console.log("GET - /api/node/data/last");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");
    console.log(data);

    var status = account.confirmNode(data.values, params.node_name, params.key);
    console.log(status);

    if (status.status.found) {
        var sheet_name = "history-" + params.key + "-" + params.node_name;
        var allData = await database.getData(sheet_name);
        console.log(allData.values);

        status.data = {};

        lastData = allData.values[allData.values.length - 1];
        for (var i = 0; i < re_data.length; i++) {
            status.data[re_data[i]] = lastData[i];
        }
    }

    res.send(status);
});

app.get("/api/node/data", async (req, res) => {
    console.log("GET - /api/node/data");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");
    console.log(data);

    var status = account.confirmNode(data.values, params.node_name, params.key);
    console.log(status);

    if (status.status.found) {
        var sheet_name = "history-" + params.key + "-" + params.node_name;
        var allData = await database.getData(sheet_name);
        console.log(allData.values);

        status.data = [];

        allData.values.shift().forEach((dataSet) => {
            pushData = {};
            for (var i = 0; i < re_data.length; i++) {
                pushData[re_data[i]] = dataSet[i];
            }
            status.data.push(pushData);
        });
    }

    res.send(status);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
