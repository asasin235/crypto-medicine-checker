const QRCode = require("qrcode");
const Jimp = require("jimp").Jimp;
const jsQR = require("jsqr");

const { signData, verifySignature } = require("./crypto.service");

async function generateQR(medicineUnitData, manufacturerPrivateKey) {
  const payload = JSON.stringify(medicineUnitData);
  const signature = signData(payload, manufacturerPrivateKey);
  const qrContent = JSON.stringify({ payload, signature });

  const base64 = await QRCode.toDataURL(qrContent, {
    errorCorrectionLevel: "H",
    type: "image/png",
  });

  return { base64, signature };
}

async function decodeQR(qrImageBuffer) {
  const image = await Jimp.read(qrImageBuffer);
  const { data, width, height } = image.bitmap;
  const uint8 = new Uint8ClampedArray(data);
  const code = jsQR(uint8, width, height);

  if (!code) {
    throw new Error("No QR code found in image");
  }

  const { payload, signature } = JSON.parse(code.data);

  return { data: JSON.parse(payload), signature };
}

function verifyQR(qrData, signature, manufacturerPublicKey) {
  const payload = JSON.stringify(qrData);

  return verifySignature(payload, signature, manufacturerPublicKey);
}

module.exports = {
  decodeQR,
  generateQR,
  verifyQR,
};
