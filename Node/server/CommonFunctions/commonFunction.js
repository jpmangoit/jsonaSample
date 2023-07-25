//packages for blob image
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function createBlobImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const blobImage = await sharp(response.data).toBuffer().then((buffer) => buffer.toString('base64'));       
        return blobImage;
    } catch (error) {
        console.error('Error creating blob image:', error);
        throw error;
    }
}

async function generateRandomAlphaNumericString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characterCount = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characterCount);
        result += characters.charAt(randomIndex);
    }
    return result;
}

module.exports = {
    createBlobImage,
    generateRandomAlphaNumericString
};