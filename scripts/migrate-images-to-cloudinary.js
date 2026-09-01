#!/usr/bin/env node

/**
 * Migration Script: Publish existing local images from wwwroot/uploads/images to Cloudinary
 * 
 * Usage:
 *   node scripts/migrate-images-to-cloudinary.js \
 *     --cloud-name YOUR_CLOUD_NAME \
 *     --api-key YOUR_API_KEY \
 *     --api-secret YOUR_API_SECRET
 * 
 * Or set environment variables:
 *   export CLOUDINARY_CLOUD_NAME="your-cloud-name"
 *   export CLOUDINARY_API_KEY="your-api-key"
 *   export CLOUDINARY_API_SECRET="your-api-secret"
 *   node scripts/migrate-images-to-cloudinary.js
 * 
 * It will:
 * 1. Scan Backend/UITour/wwwroot/uploads/images for all images.
 * 2. Upload them concurrently to Cloudinary under folder 'uitour'.
 * 3. Save a mapping JSON file: scripts/migration_mapping.json.
 * 4. Generate an SQL update script: scripts/migration_update_database.sql.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cloud-name' && args[i + 1]) config.cloudName = args[++i];
    else if (args[i] === '--api-key' && args[i + 1]) config.apiKey = args[++i];
    else if (args[i] === '--api-secret' && args[i + 1]) config.apiSecret = args[++i];
    else if (args[i] === '--folder' && args[i + 1]) config.folder = args[++i];
    else if (args[i] === '--concurrency' && args[i + 1]) config.concurrency = parseInt(args[++i], 10);
    else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Cloudinary Image Migration Tool

Options:
  --cloud-name    Cloudinary Cloud Name
  --api-key       Cloudinary API Key
  --api-secret    Cloudinary API Secret
  --folder        Destination folder in Cloudinary (default: 'uitour')
  --concurrency   Number of concurrent uploads (default: 5)
  --help, -h      Show this help message
      `);
      process.exit(0);
    }
  }
  return config;
}

// Load config from appsettings.json if available
function loadConfigFromAppSettings() {
  const appSettingsPaths = [
    path.join(rootDir, 'Backend', 'UITour', 'appsettings.json'),
    path.join(rootDir, 'Backend', 'UITour', 'appsettings.Production.json')
  ];

  for (const configPath of appSettingsPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const json = JSON.parse(content);
        if (json.CloudinarySettings && json.CloudinarySettings.CloudName && !json.CloudinarySettings.CloudName.startsWith('YOUR_')) {
          return {
            cloudName: json.CloudinarySettings.CloudName,
            apiKey: json.CloudinarySettings.ApiKey,
            apiSecret: json.CloudinarySettings.ApiSecret
          };
        }
      } catch (err) {
        // ignore parse error
      }
    }
  }
  return {};
}

async function uploadSingleImage({ filePath, fileName, cloudName, apiKey, apiSecret, folder }) {
  const publicId = path.parse(fileName).name;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signature parameter string (sorted alphabetically by key)
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('public_id', publicId);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errBody}`);
  }

  const result = await response.json();
  return {
    fileName,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    url: result.url,
    bytes: result.bytes,
    format: result.format
  };
}

async function runMigration() {
  const cliArgs = parseArgs();
  const fileConfig = loadConfigFromAppSettings();

  const cloudName = cliArgs.cloudName || process.env.CLOUDINARY_CLOUD_NAME || fileConfig.cloudName;
  const apiKey = cliArgs.apiKey || process.env.CLOUDINARY_API_KEY || fileConfig.apiKey;
  const apiSecret = cliArgs.apiSecret || process.env.CLOUDINARY_API_SECRET || fileConfig.apiSecret;
  const folder = cliArgs.folder || 'uitour';
  const concurrency = cliArgs.concurrency || 5;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error(`\n❌ Error: Missing Cloudinary credentials.`);
    console.error(`Please provide --cloud-name, --api-key, and --api-secret as arguments,`);
    console.error(`or set environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET\n`);
    process.exit(1);
  }

  const imagesDir = path.join(rootDir, 'Backend', 'UITour', 'wwwroot', 'uploads', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.error(`\n❌ Error: Directory not found: ${imagesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
  });

  if (files.length === 0) {
    console.log(`\n⚠️  No images found in ${imagesDir}`);
    process.exit(0);
  }

  console.log(`\n🚀 Starting Cloudinary migration:`);
  console.log(`   - Cloud Name: ${cloudName}`);
  console.log(`   - Folder:     ${folder}`);
  console.log(`   - Total Files: ${files.length}`);
  console.log(`   - Concurrency: ${concurrency}\n`);

  const successfulUploads = [];
  const failedUploads = [];

  let completedCount = 0;

  // Simple concurrency worker pool
  async function worker(queue) {
    while (queue.length > 0) {
      const fileName = queue.shift();
      const filePath = path.join(imagesDir, fileName);
      try {
        const result = await uploadSingleImage({
          filePath,
          fileName,
          cloudName,
          apiKey,
          apiSecret,
          folder
        });
        successfulUploads.push(result);
        completedCount++;
        console.log(`✅ [${completedCount}/${files.length}] Uploaded: ${fileName} -> ${result.secureUrl}`);
      } catch (err) {
        failedUploads.push({ fileName, error: err.message });
        completedCount++;
        console.error(`❌ [${completedCount}/${files.length}] Failed: ${fileName} - ${err.message}`);
      }
    }
  }

  const queue = [...files];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => worker(queue));
  await Promise.all(workers);

  console.log(`\n================== Migration Summary ==================`);
  console.log(`   Total Processed: ${files.length}`);
  console.log(`   Successful:      ${successfulUploads.length}`);
  console.log(`   Failed:          ${failedUploads.length}`);

  // 1. Save mapping JSON file
  const mappingFilePath = path.join(__dirname, 'migration_mapping.json');
  fs.writeFileSync(mappingFilePath, JSON.stringify(successfulUploads, null, 2), 'utf8');
  console.log(`\n📄 URL Mapping saved to: ${mappingFilePath}`);

  // 2. Generate SQL update script
  const sqlStatements = [
    `-- ==========================================================`,
    `-- Cloudinary Migration SQL Script for UITour Database`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total migrated images: ${successfulUploads.length}`,
    `-- ==========================================================`,
    ``,
    `BEGIN TRANSACTION;`,
    ``
  ];

  for (const item of successfulUploads) {
    const escapedUrl = item.secureUrl.replace(/'/g, "''");
    const escapedName = item.fileName.replace(/'/g, "''");

    sqlStatements.push(`-- Update records for ${escapedName}`);
    sqlStatements.push(`UPDATE PropertyPhotos SET [Url] = '${escapedUrl}' WHERE [Url] LIKE '%${escapedName}%';`);
    sqlStatements.push(`UPDATE TourPhotos SET [Url] = '${escapedUrl}' WHERE [Url] LIKE '%${escapedName}%';`);
    sqlStatements.push(`UPDATE ExperienceDetails SET [ImageUrl] = '${escapedUrl}' WHERE [ImageUrl] LIKE '%${escapedName}%';`);
    sqlStatements.push(`UPDATE Users SET [Avatar] = '${escapedUrl}' WHERE [Avatar] LIKE '%${escapedName}%';`);
    sqlStatements.push(``);
  }

  sqlStatements.push(`COMMIT TRANSACTION;`);
  sqlStatements.push(`PRINT 'Successfully updated image URLs in database to Cloudinary.';`);

  const sqlFilePath = path.join(__dirname, 'migration_update_database.sql');
  fs.writeFileSync(sqlFilePath, sqlStatements.join('\n'), 'utf8');
  console.log(`💾 SQL update script generated: ${sqlFilePath}\n`);

  if (failedUploads.length > 0) {
    const failedFilePath = path.join(__dirname, 'migration_failed.json');
    fs.writeFileSync(failedFilePath, JSON.stringify(failedUploads, null, 2), 'utf8');
    console.log(`⚠️  Failed uploads saved to: ${failedFilePath}\n`);
  }
}

runMigration().catch(err => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
