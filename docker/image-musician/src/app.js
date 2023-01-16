const dgram = require('node:dgram');
const crypto = require('crypto');

// Variable definition
let instrument_sound;
let client;
let uuid = crypto.randomUUID();

// Get the sound of an instrument
function get_instrument_sound(instrument) {
   switch (instrument) {
      case 'piano' : return 'ti-ta-ti';
      case 'trumpet': return 'pouet';
      case 'flute': return 'truli';
      case 'violin': return 'gzi-gzi';
      case 'drum': return 'boum-boum';
      default: return null;
   }
}

function start() {
   if (process.argv.length < 3) {
      console.error("Missing argument 'instrument'");
      return;
   }

   // Get the third argument (node [filename] [instrument])
   instrument_sound = get_instrument_sound(process.argv[2]);

   if (instrument_sound == null) {
      console.error("Invalid instrument");
      return;
   }

   client = dgram.createSocket('udp4');

   client.connect(4242, '239.224.1.2', (err) => {
      setInterval(play, 1000);
   });

   // Play a sound every seconds
}

// Play a sound
function play() {
   // Connect to multicast address and send the instrument sound
   client.send(Buffer.from(uuid + " " + instrument_sound), (err) => {
      if (err != null)
         console.error(err);
   });
}

// Start the program
start();