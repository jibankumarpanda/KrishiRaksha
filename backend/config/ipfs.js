// ===================================================================
// FILE 4: backend/config/ipfs.js
// IPFS Client Configuration (using Pinata or IPFS HTTP Client)
// ===================================================================

const ipfsClient = require('ipfs-http-client');
const FormData = require('form-data');
const axios = require('axios');

// Option 1: Using Pinata (Recommended for production)
const uploadToPinata = async (fileBuffer, filename) => {
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, filename);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log('✅ File uploaded to IPFS:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('❌ IPFS upload failed:', error.message);
    throw error;
  }
};

// Option 2: Using local IPFS node
const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

const uploadToIPFS = async (fileBuffer, filename) => {
  try {
    const result = await ipfs.add({ path: filename, content: fileBuffer });
    console.log('✅ File uploaded to IPFS:', result.cid.toString());
    return result.cid.toString();
  } catch (error) {
    console.error('❌ IPFS upload failed:', error.message);
    throw error;
  }
};

module.exports = { uploadToPinata, uploadToIPFS };