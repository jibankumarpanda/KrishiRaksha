// ===================================================================
// FILE: backend/services/ipfs.service.js
// ===================================================================

const { uploadToPinata } = require('../config/ipfs');

class IPFSService {
  // Upload single file
  static async uploadFile(fileBuffer, filename) {
    try {
      const ipfsHash = await uploadToPinata(fileBuffer, filename);
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      return {
        success: true,
        ipfsHash,
        url,
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(files) {
    try {
      const uploads = await Promise.all(
        files.map(file => this.uploadFile(file.buffer, file.originalname))
      );
      
      const successfulUploads = uploads.filter(u => u.success);
      const urls = successfulUploads.map(u => u.url);
      const hashes = successfulUploads.map(u => u.ipfsHash);
      
      return {
        success: true,
        urls,
        hashes,
        mainHash: hashes[0], // Primary hash for blockchain
      };
    } catch (error) {
      console.error('Multiple upload failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = IPFSService;