const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:2000/api/v2/connect');
ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'init',
    language: 'c',
    version: '*',
    files: [{ name: 'main.c', content: '#include <stdio.h>\nint main() { printf("Hello C"); return 0; }' }]
  }));
});
ws.on('message', data => console.log('Message:', JSON.parse(data)));
ws.on('error', err => console.log('Error:', err));
ws.on('close', () => console.log('Closed'));
