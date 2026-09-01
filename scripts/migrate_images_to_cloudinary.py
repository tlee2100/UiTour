#!/usr/bin/env python3
"""
Migration Script: Publish existing local images from wwwroot/uploads/images to Cloudinary

Usage:
  python3 scripts/migrate_images_to_cloudinary.py \
    --cloud-name YOUR_CLOUD_NAME \
    --api-key YOUR_API_KEY \
    --api-secret YOUR_API_SECRET

Or set environment variables:
  export CLOUDINARY_CLOUD_NAME="your-cloud-name"
  export CLOUDINARY_API_KEY="your-api-key"
  export CLOUDINARY_API_SECRET="your-api-secret"
  python3 scripts/migrate_images_to_cloudinary.py

This script will:
1. Scan Backend/UITour/wwwroot/uploads/images for all images.
2. Upload them concurrently to Cloudinary under folder 'uitour'.
3. Save a mapping JSON file: scripts/migration_mapping.json.
4. Generate an SQL update script: scripts/migration_update_database.sql.
"""

import os
import sys
import json
import time
import hashlib
import argparse
from pathlib import Path
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_root_dir():
    return Path(__file__).resolve().parent.parent

def load_config_from_appsettings():
    root = get_root_dir()
    for conf_name in ["appsettings.json", "appsettings.Production.json"]:
        p = root / "Backend" / "UITour" / conf_name
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    c_settings = data.get("CloudinarySettings", {})
                    cloud_name = c_settings.get("CloudName", "")
                    if cloud_name and not cloud_name.startswith("YOUR_"):
                        return {
                            "cloud_name": cloud_name,
                            "api_key": c_settings.get("ApiKey", ""),
                            "api_secret": c_settings.get("ApiSecret", "")
                        }
            except Exception:
                pass
    return {}

def create_multipart_formdata(fields, files):
    boundary = f"----WebKitFormBoundary{hashlib.md5(str(time.time()).encode()).hexdigest()}"
    body = bytearray()
    
    for key, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode())
        body.extend(f"{value}\r\n".encode())
        
    for key, (filename, content, content_type) in files.items():
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"\r\n'.encode())
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode())
        body.extend(content)
        body.extend(b"\r\n")
        
    body.extend(f"--{boundary}--\r\n".encode())
    content_type_header = f"multipart/form-data; boundary={boundary}"
    return body, content_type_header

def upload_single_image(file_path, file_name, cloud_name, api_key, api_secret, folder):
    public_id = Path(file_name).stem
    timestamp = int(time.time())
    
    # Cloudinary signature (alphabetically sorted parameters + api_secret)
    params_to_sign = f"folder={folder}&public_id={public_id}&timestamp={timestamp}{api_secret}"
    signature = hashlib.sha1(params_to_sign.encode("utf-8")).hexdigest()
    
    with open(file_path, "rb") as f:
        file_bytes = f.read()
        
    ext = Path(file_name).suffix.lower()
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml"
    }
    content_type = content_types.get(ext, "application/octet-stream")
    
    fields = {
        "api_key": api_key,
        "timestamp": str(timestamp),
        "folder": folder,
        "public_id": public_id,
        "signature": signature
    }
    files = {
        "file": (file_name, file_bytes, content_type)
    }
    
    body, header_content_type = create_multipart_formdata(fields, files)
    url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
    
    req = urllib.request.Request(url, data=body, headers={"Content-Type": header_content_type})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            return {
                "fileName": file_name,
                "publicId": resp_data.get("public_id"),
                "secureUrl": resp_data.get("secure_url"),
                "url": resp_data.get("url"),
                "bytes": resp_data.get("bytes"),
                "format": resp_data.get("format")
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code}: {err_msg}")
    except Exception as e:
        raise RuntimeError(str(e))

def main():
    parser = argparse.ArgumentParser(description="Migrate local images to Cloudinary")
    parser.add_argument("--cloud-name", help="Cloudinary Cloud Name")
    parser.add_argument("--api-key", help="Cloudinary API Key")
    parser.add_argument("--api-secret", help="Cloudinary API Secret")
    parser.add_argument("--folder", default="uitour", help="Destination folder in Cloudinary")
    parser.add_argument("--concurrency", type=int, default=5, help="Number of concurrent uploads")
    args = parser.parse_args()
    
    file_config = load_config_from_appsettings()
    cloud_name = args.cloud_name or os.environ.get("CLOUDINARY_CLOUD_NAME") or file_config.get("cloud_name")
    api_key = args.api_key or os.environ.get("CLOUDINARY_API_KEY") or file_config.get("api_key")
    api_secret = args.api_secret or os.environ.get("CLOUDINARY_API_SECRET") or file_config.get("api_secret")
    folder = args.folder
    concurrency = args.concurrency
    
    if not cloud_name or not api_key or not api_secret:
        print("\n❌ Error: Missing Cloudinary credentials.", file=sys.stderr)
        print("Please provide --cloud-name, --api-key, and --api-secret as arguments,", file=sys.stderr)
        print("or set environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET\n", file=sys.stderr)
        sys.exit(1)
        
    root = get_root_dir()
    images_dir = root / "Backend" / "UITour" / "wwwroot" / "uploads" / "images"
    if not images_dir.exists():
        print(f"\n❌ Error: Directory not found: {images_dir}", file=sys.stderr)
        sys.exit(1)
        
    valid_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    files = [f.name for f in images_dir.iterdir() if f.is_file() and f.suffix.lower() in valid_exts]
    
    if not files:
        print(f"\n⚠️  No images found in {images_dir}")
        sys.exit(0)
        
    print(f"\n🚀 Starting Cloudinary migration:")
    print(f"   - Cloud Name:  {cloud_name}")
    print(f"   - Folder:      {folder}")
    print(f"   - Total Files: {len(files)}")
    print(f"   - Concurrency: {concurrency}\n")
    
    successful_uploads = []
    failed_uploads = []
    completed_count = 0
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        future_to_file = {
            executor.submit(
                upload_single_image,
                images_dir / f_name,
                f_name,
                cloud_name,
                api_key,
                api_secret,
                folder
            ): f_name
            for f_name in files
        }
        
        for future in as_completed(future_to_file):
            f_name = future_to_file[future]
            completed_count += 1
            try:
                result = future.result()
                successful_uploads.append(result)
                print(f"✅ [{completed_count}/{len(files)}] Uploaded: {f_name} -> {result['secureUrl']}")
            except Exception as e:
                failed_uploads.append({"fileName": f_name, "error": str(e)})
                print(f"❌ [{completed_count}/{len(files)}] Failed: {f_name} - {e}", file=sys.stderr)
                
    print("\n================== Migration Summary ==================")
    print(f"   Total Processed: {len(files)}")
    print(f"   Successful:      {len(successful_uploads)}")
    print(f"   Failed:          {len(failed_uploads)}")
    
    script_dir = Path(__file__).resolve().parent
    
    # 1. Save JSON mapping
    mapping_path = script_dir / "migration_mapping.json"
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(successful_uploads, f, indent=2)
    print(f"\n📄 URL Mapping saved to: {mapping_path}")
    
    # 2. Generate SQL update script
    sql_lines = [
        "-- ==========================================================",
        "-- Cloudinary Migration SQL Script for UITour Database",
        f"-- Total migrated images: {len(successful_uploads)}",
        "-- ==========================================================",
        "",
        "BEGIN TRANSACTION;",
        ""
    ]
    
    for item in successful_uploads:
        escaped_url = item["secureUrl"].replace("'", "''")
        escaped_name = item["fileName"].replace("'", "''")
        sql_lines.append(f"-- Update records for {escaped_name}")
        sql_lines.append(f"UPDATE PropertyPhotos SET [Url] = '{escaped_url}' WHERE [Url] LIKE '%{escaped_name}%';")
        sql_lines.append(f"UPDATE TourPhotos SET [Url] = '{escaped_url}' WHERE [Url] LIKE '%{escaped_name}%';")
        sql_lines.append(f"UPDATE ExperienceDetails SET [ImageUrl] = '{escaped_url}' WHERE [ImageUrl] LIKE '%{escaped_name}%';")
        sql_lines.append(f"UPDATE Users SET [Avatar] = '{escaped_url}' WHERE [Avatar] LIKE '%{escaped_name}%';")
        sql_lines.append("")
        
    sql_lines.append("COMMIT TRANSACTION;")
    sql_lines.append("PRINT 'Successfully updated image URLs in database to Cloudinary.';")
    
    sql_path = script_dir / "migration_update_database.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))
    print(f"💾 SQL update script generated: {sql_path}\n")
    
    if failed_uploads:
        failed_path = script_dir / "migration_failed.json"
        with open(failed_path, "w", encoding="utf-8") as f:
            json.dump(failed_uploads, f, indent=2)
        print(f"⚠️  Failed uploads saved to: {failed_path}\n")

if __name__ == "__main__":
    main()
