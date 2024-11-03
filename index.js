const express = require("express");
const cookieParser = require("cookie-parser");
const database = require(path.join(process.cwd(), "database.json"));
const account = require(path.join(process.cwd(), "account.json"));

const app = express();

app.use(cookieParser());

app.use(express.json());

app.get("/api", (req, res) => {
    res.send("Server is online...");
});

app.get("/api/login", async (req, res) => {
    var body = req.body;

    var data = await database.getData("account-database");

	var status = account.matchAccount(data.values, body.username, body.password)

	res.cookie("key", status.key);
    res.send(status);
});

app.put("/api/register", async (req, res) => {
    var body = req.body;

    var key = account.generateKey();

	var data = await database.getData("account-database");

    var status = account.confirmCreate(data.values, body.username, key);
	if (status.status.username) {
		database.putData("account-database!A:C", [body.username, body.password, key]);
	}

	res.cookie("key", key)
    res.send(status);
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
