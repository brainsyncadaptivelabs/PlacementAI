const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:2000/api/v2/connect');
ws.on('open', () => {
    ws.send(JSON.stringify({
        type: "init",
        language: "sqlite3",
        version: "*",
        files: [{ name: "schema.sql", content: "SELECT 1" }]
    }));
});
ws.on('message', (data) => console.log(JSON.parse(data.toString())));
