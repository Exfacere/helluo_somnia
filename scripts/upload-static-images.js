// Script to upload specific images to Cloudinary
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(filePath, publicId) {
    console.log(`Uploading ${filePath}...`);
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'helluo-somnia',
            public_id: publicId,
            overwrite: true,
        });
        console.log(`✓ Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`✗ Error uploading ${filePath}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('Uploading hero and about images to Cloudinary...\n');

    const heroUrl = await uploadImage(
        path.join(process.cwd(), 'public/Images/Pyro3.webp'),
        'pyro3-hero'
    );

    const aboutUrl = await uploadImage(
        path.join(process.cwd(), 'public/Images/MePicAbout.webp'),
        'about-profile'
    );

    console.log('\n--- Results ---');
    console.log('Hero image:', heroUrl);
    console.log('About image:', aboutUrl);
}

main();
