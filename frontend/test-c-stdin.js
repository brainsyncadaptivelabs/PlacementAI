const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:2000/api/v2/connect');
ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'init',
    language: 'c',
    version: '*',
    files: [{ name: 'main.c', content: '#include <stdio.h>\nint main() { int x; printf("Enter number:"); scanf("%d", &x); printf("You entered %d\\n", x); return 0; }' }]
  }));
});
ws.on('message', data => {
  const msg = JSON.parse(data);
  console.log('Message:', msg);
  if (msg.type === 'data' && msg.data.includes("Enter number:")) {
    ws.send(JSON.stringify({ type: 'data', stream: 'stdin', data: '42\n' }));
  }
});
ws.on('error', err => console.log('Error:', err));
ws.on('close', () => console.log('Closed'));
