const dgram = require('node:dgram');
const net = require('node:net');

const TCP_PORT = 2205;
const UDP_PORT = 4242;
const UDP_MULTICAST = "239.224.1.2";

const udpServer = dgram.createSocket('udp4');
const musicians = new Map();

// Get the instrument with its sound
function get_instrument_from_sound(instrument) {
   switch (instrument) {
      case 'ti-ta-ti': return 'piano';
      case 'pouet': return 'trumpet';
      case 'truli': return 'flute';
      case 'gzi-gzi': return 'violin';
      case 'boum-boum': return 'drum';
      default: return null;
   }
}

//--- UDP Server handlers ---
udpServer.on('error', (err) => {
   console.error(`server error:\n${err.stack}`);
   server.close();
});

udpServer.on('message', (msg, rinfo) => {

   let msg_split = msg.toString().split(" ");
   let uuid = msg_split[0];
   let instrument = get_instrument_from_sound(msg_split[1]);

   if (!musicians.has(uuid)) {
      musicians.set(uuid, { instrument: instrument, activeSince: Date.now(), lastActive: Date.now });
   } else {
      let musician = musicians.get(uuid);
      musician.lastActive = Date.now();
      musicians.set(uuid, musician);
   }
});

udpServer.on('listening', () => {
   const address = udpServer.address();
   console.log(`server listening ${address.address}:${address.port}`);
});

udpServer.bind(UDP_PORT, () => {
   udpServer.addMembership(UDP_MULTICAST);
}); 

//------

//--- TCP Server handlers ---
const tcpServer = net.createServer((c) => {
   // 'connection' listener.
   console.log('client connected');

   for (let [uuid, musician] of musicians) {
      if (Date.now() - musician.lastActive > 5000)
         musicians.delete(uuid);
   }

   let jsonMusicians = [];
   
   for (let [uuid, musician] of musicians) {
      jsonMusicians.push({ uuid: uuid, instrument: musician.instrument, activeSince: new Date(musician.activeSince).toISOString() });
   }

   jsonMusicians = JSON.stringify(jsonMusicians);
   
   c.write(jsonMusicians);
   c.end();
});

tcpServer.on('end', () => {
   console.log('client disconnected');
});
tcpServer.on('error', (err) => {
   console.log('Serveur tcp erreur : ' + err);
});
tcpServer.listen(TCP_PORT, () => {
   console.log('server bound');
});
