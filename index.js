const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cookieParser = require("cookie-parser");
const cors = require("cors");

// const zip = require("./zip.js");
const account = require("./account.js");
const database = require("./database.js");
const analyze_water = require("./analyze_water.js");
const analyze_fertilizer = require("./analyze_fertilizer.js");
const analyze_environment = require("./analyze_environment.js");
const analyze_vpd = require("./analyze_vpd.js");

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

    // exam
    if (params.username == "example") {
        key = "testkey1";
    }

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
        "ph",
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
    "ph",
];

app.put("/api/node/data", async (req, res) => {
    console.log("PUT - /api/node/data");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");
    console.log(data.values);

    var status = account.confirmNode(data.values, params.node_name, params.key);
    console.log(status);

    if (params.date == "time") {
        let datetime = new Date();
        params.date = datetime.toLocaleString("th-TH", "Thailand/Bangkok");
        console.log(params.date);
    }

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

test_status = {
    "date" : "date",
    "temp" : "temp",
    "humi" : "humi",
    "soil_humi" : "soil_humi",
    "air_press" : "air_press",
    "altitude" : "altitude",
    "light" : "light",
    "wind_speed" : "wind_speed",
};

app.put("/test/node/data", async (req, res) => {
    console.log("PUT - /test/node/data");

    var params = req.query;
    console.log(params);

    var data = await database.getData("node-name-database");
    console.log(data.values);

    var status = account.confirmNode(data.values, params.node_name, params.key);
    console.log(status);

    // if (status.status.found) {
    //     var adding_data = [];
    //     re_data.forEach((_data) => {
    //         adding_data.push(params[_data]);
    //     });
    //     sheet_name = "history-" + params.key + "-" + params.node_name;
    //     selector = "!A:H";
    //     database.putData(sheet_name + selector, adding_data);
    // }

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

    var result = analyze_water.analyzeWateringNeeds(
        params.temp,
        params.soil_humi,
        params.humi,
        params.light,
        params.crop_name
    );

    console.log(result);

    res.send(result);
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

    var result = analyze_environment.scoreEnvironment(params.crop_name, {
        temp: params.temp,
        humi: params.humi,
        soil_humi: params.soil_humi,
        light: params.light,
        wind_speed: params.wind_speed,
        ph: params.ph
    });

    console.log(result);

    res.send(result);
});

app.get("/api/analyze", async (req, res) => {
    console.log("GET - /api/analyze");

    var params = req.query;
    console.log(params);

    var result_vpd = analyze_vpd.calculateVPD(params.temp, params.humi);

    var result_water = analyze_water.analyzeWateringNeeds(
        params.temp,
        params.soil_humi,
        params.humi,
        params.light,
        params.crop_name
    );

    res.send({ result_vpd: result_vpd, result_water: result_water });
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

var clientRoomConnect = {
    /* 
    id : room
    */
};
var liveInterval = {};

function disconnectRoom(room_name) {
    let clientsInRoom = io.sockets.adapter.rooms.get(room_name);
    if (!clientsInRoom || clientsInRoom.size < 1) {
        clearInterval(liveInterval[room_name]);
        delete liveInterval[room_name];
    }
}

io.on("connection", (socket) => {
    console.log(socket.handshake.query);
    // socket.join(
    //     socket.handshake.query.key + ":" + socket.handshake.query.node_name
    // );
    console.log("rooms:", io.sockets.adapter.rooms);

    console.log("user connected:", socket.id);
    socket.on("disconnect", () => {
        console.log(io.sockets.adapter.rooms);

        disconnectRoom(clientRoomConnect[socket.id]);
        delete clientRoomConnect[socket.id];

        console.log(liveInterval);
        console.log(clientRoomConnect);
        console.log("user disconnected:", socket.id);
    });

    socket.on("leaveLive", (params) => {
        var room_name = params.key + ":" + params.node_name;
        var room = room_name;

        console.log("leaveJoin:", room);

        socket.leave(room);
        disconnectRoom(room_name);
        delete clientRoomConnect[socket.id];

        console.log(io.sockets.adapter.rooms);
        console.log(liveInterval);
        console.log(clientRoomConnect);
    });

    socket.on("leaveLiveId", () => {
        console.log(io.sockets.adapter.rooms);

        socket.leave(clientRoomConnect[socket.id]);
        disconnectRoom(clientRoomConnect[socket.id]);
        delete clientRoomConnect[socket.id];

        console.log("leaveLiveId");
        console.log(socket.id);
        console.log(liveInterval);
        console.log(clientRoomConnect);
    });

    socket.on("live", (params) => {
        var room_name = params.key + ":" + params.node_name;

        if (!io.sockets.adapter.rooms.get(room_name)) {
            // Never create
            liveInterval[room_name] = setInterval(async () => {
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
                    status.result = {};

                    lastData = allData.values[allData.values.length - 1];
                    for (var i = 0; i < re_data.length; i++) {
                        status.data[re_data[i]] = lastData[i];
                    }

                    console.log("lastData:", lastData);
                    console.log(re_data.indexOf("temp"));

                    status.result.water = analyze_water.analyzeWateringNeeds(
                        Number(lastData[re_data.indexOf("temp")]),
                        Number(lastData[re_data.indexOf("soil_humi")]),
                        Number(lastData[re_data.indexOf("humi")]),
                        Number(lastData[re_data.indexOf("light")]),
                        params.crop_name
                    );

                    status.result.environment =
                        analyze_environment.scoreEnvironment(params.crop_name, {
                            temp: Number(lastData[re_data.indexOf("temp")]),
                            humi: Number(lastData[re_data.indexOf("humi")]),
                            soil_humi: Number(
                                lastData[re_data.indexOf("soil_humi")]
                            ),
                            light: Number(lastData[re_data.indexOf("light")]),
                            wind_speed: Number(
                                lastData[re_data.indexOf("wind_speed")]
                            ),
                        });

                    status.result.fertilizer =
                        analyze_fertilizer.analyzeFertilizer(
                            params.crop_name,
                            Number(lastData[re_data.indexOf("temp")]),
                            Number(lastData[re_data.indexOf("humi")]),
                            Number(lastData[re_data.indexOf("soil_humi")]),
                            Number(lastData[re_data.indexOf("light")]),
                            (gram = true)
                        );

                    status.result.vpd = analyze_vpd.calculateVPD(
                        Number(lastData[re_data.indexOf("temp")]),
                        Number(lastData[re_data.indexOf("humi")])
                    );

                    // var client_list = Array.from(
                    //     io.sockets.adapter.rooms.get(room_name)
                    // );
                    // console.log("room_name:", room_name, client_list);
                    console.log(io.sockets.adapter.rooms);
                    console.log(liveInterval);
                    console.log(clientRoomConnect);
                }

                io.to(room_name).emit("live", status);
            }, (process.env.live_delay || 5) * 1000);
        }
        socket.join(room_name);
        clientRoomConnect[socket.id] = room_name;
    });

    socket.on("live/test", () => {
        console.log("live/test", test_status);
        io.emit("live/test", test_status);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
