const { google } = require("googleapis");

async function getData(selector) {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.cwd() + "/google.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1WgbkT7wN3tYMaeruVPw6l0GnuPDD1p4VmZIj8bApiME";

    const data = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: selector,
    });

    return data.data;
}

async function putData(selector, data) {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.cwd() + "/google.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1WgbkT7wN3tYMaeruVPw6l0GnuPDD1p4VmZIj8bApiME";

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: selector,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [data],
        },
    });
}

module.exports = { getData, putData };
