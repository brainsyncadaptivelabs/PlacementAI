const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:2000/api/v2/connect');
ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'init',
    language: 'python',
    version: '*',
    files: [{ name: 'main.py', content: 'import sys\nprint("Enter something:")\nsys.stdout.flush()\nx = input()\nprint("You entered:", x)' }]
  }));
});
ws.on('message', data => {
  const msg = JSON.parse(data);
  console.log('Message:', msg);
  if (msg.type === 'data' && msg.data.includes("Enter something:")) {
    ws.send(JSON.stringify({ type: 'data', stream: 'stdin', data: 'my input\n' }));
  }
});
ws.on('error', err => console.log('Error:', err));
ws.on('close', () => console.log('Closed'));
