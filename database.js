const { google } = require("googleapis");

google_json_path = "./google.json";
const auth = new google.auth.GoogleAuth({
    keyFile: google_json_path,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});
const client = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: client });
const spreadsheetId = "1WgbkT7wN3tYMaeruVPw6l0GnuPDD1p4VmZIj8bApiME";

async function getData(selector) {
    const data = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: selector,
    });

    return data.data;
}

async function putData(selector, data) {
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

async function createSheet(title) {
    try {
        const request = {
            auth,
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: title,
                            },
                        },
                    },
                ],
            },
        };

        const response = await googleSheets.spreadsheets.batchUpdate(request);
    } catch (err) {
        console.log(title + " already use.")
    }
}

module.exports = { getData, putData, createSheet };
