const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const zip = require("./zip.js");
const account = require("./account.js");
const database = require("./database.js");
const analyze_water = require("./analyze_water.js");
const analyze_fertilizer = require("./analyze_fertilizer.js");
const analyze_environment = require("./analyze_environment.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

var mode = process.env.mode || "test";
if (mode == "test") {
    var origin = "http://127.0.0.1:5500";
} else if (mode == "deploy") {
    var origin = "https://farmassist-10caf.web.app";
}
app.use(
    cors({
        origin: origin,
        credentials: true,
    })
);

// Middleware เพื่อรองรับ HTTP และ HTTPS
app.use((req, res, next) => {
    if (req.protocol === "http") {
        console.log("Accessed via HTTP");
        // คุณสามารถปล่อยให้ HTTP ทำงาน หรือ redirect ไปที่ HTTPS (ถ้าต้องการ)
        // return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

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

    await database.putData(sheet_name + "!A1:H1", [
        "date",
        "temperature",
        "humidity",
        "humidity soil",
        "air pressure",
        "altitude",
        "light",
        "wind speed",
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
        database.putData("node-name-database!A:C", [
            params.key,
            params.node_name,
            params.plant_type,
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

re_data = [
    "date",
    "temp",
    "humi",
    "soil_humi",
    "air_press",
    "altitude",
    "light",
    "wind_speed",
];

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
        selector = "!A:H";
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

        allData.values.shift();

        allData.values.forEach((dataSet) => {
            pushData = {};
            for (var i = 0; i < re_data.length; i++) {
                pushData[re_data[i]] = dataSet[i];
            }
            status.data.push(pushData);
        });

        if (params.zip === "true") {
            status.data = zip.zipObject(status.data);
            console.log(status.data);
        }
    }

    res.send(status);
});

app.get("/api/analyze/water", async (req, res) => {
    console.log("GET - /api/analyze/water");

    var params = req.query;
    console.log(params);

    var vpd = analyze_water.calculateVPD(params.temp, params.humi);
    var water_analyze_result = analyze_water.analyzeWateringNeeds(
        vpd,
        params.humi_soil,
        params.humi_soil_limit || false,
        params.high_vpd || false,
        params.low_vpd || false
    );
    var response = {
        vpd: vpd,
        watering: water_analyze_result.watering,
        recommendation: water_analyze_result.recommendation,
    };
    console.log(response);

    res.send(response);
});

app.get("/api/analyze/fertilizer", async (req, res) => {
    console.log("GET - /api/analyze/fertilizer");

    var params = req.query;
    console.log(params);

    var result = analyze_fertilizer.fertilizerRecommendations(
        params.plant_type
    );
    console.log(result);

    res.send(result);
});

app.get("/api/analyze/environment", async (req, res) => {
    console.log("GET - /api/analyze/environment");

    var params = req.query;
    console.log(params);

    var result = analyze_environment.analyzeEnvironmentStatus(
        (plantType = params.plant_type),
        (temperature = params.temp),
        (humidity = params.humi),
        (soilMoisture = params.soil_humi),
        (light = params.light)
    ).thaiSummary;

    var response = {
        overall: result.status,
        temp: result.details.temperature,
        humi: result.details.humidity,
        soil_humi: result.details.soilMoisture,
        light: result.details.light,
    };

    console.log(response);

    res.send(response);
});

app.get("/api/node/plant_type", async (req, res) => {
    console.log("GET - /api/node/data/plant_type");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");

    console.log(data.values);

    var response = account.plantTypeList(data.values, params.key);

    console.log(response);

    res.send(response);
});

io.on("connection", (socket) => {
    console.log("user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("live", (params) => {
        setInterval(async () => {
            console.log("params: " + params);
            var key = params.key;
            var node_name = params.node_name;
            console.log(key);
            console.log(node_name);

            var data = await database.getData("node-name-database");
            console.log(data);

            var status = account.confirmNode(
                data.values,
                params.node_name,
                params.key
            );
            console.log(status);

            if (status.status.found) {
                var sheet_name =
                    "history-" + params.key + "-" + params.node_name;
                var allData = await database.getData(sheet_name);
                console.log(allData.values);

                status.data = {};

                lastData = allData.values[allData.values.length - 1];
                for (var i = 0; i < re_data.length; i++) {
                    status.data[re_data[i]] = lastData[i];
                }
            }

            io.emit("live", status);
        }, 2000);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
