const dgram = require('node:dgram');
const net = require('node:net');

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
   console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

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

udpServer.bind(4242, () => {
   udpServer.addMembership("239.224.1.2");
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

   
   console.log(JSON.stringify(musicians));

   c.write(JSON.stringify(musicians));
});

tcpServer.on('end', () => {
   console.log('client disconnected');
});
tcpServer.on('error', (err) => {
   console.log('Serveur tcp erreur : ' + err);
});
tcpServer.listen(2205, () => {
   console.log('server bound');
});


