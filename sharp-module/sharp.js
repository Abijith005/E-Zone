
const sharp = require('sharp');

sharp('')
  .resize(300, 300, {
    kernel: sharp.kernel.nearest,
    fit: 'contain',
    position: 'center',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .toFile('output1.png')
  .then(() => {
    // output.png is a 200 pixels wide and 300 pixels high image
    // containing a nearest-neighbour scaled version
    // contained within the north-east corner of a semi-transparent white canvas
    console.log("success")
  });