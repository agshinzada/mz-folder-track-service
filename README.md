# Folder Tracking Service

## Overview
The **Folder Tracking Service** is a Node.js application that automatically monitors a specific folder and organizes files on a daily basis.  
Every day, it creates a new folder named after the current date and processes any incoming `.jpg` or `.png` files.  
The system recognizes the content of each file, extracts the required data, and integrates with an ERP system.  
If a match is found, the corresponding image is uploaded to the server and linked to the related document in the database.

## Features
- Automatic daily folder creation with date-based naming.
- Continuous monitoring of folders for incoming `.jpg` and `.png` files.
- Image recognition and data extraction.
- ERP system integration:
  - Matching documents based on recognized data.
  - Uploading validated images to the server.
  - Creating and maintaining database relations.
- Fully automated background service.

## Tech Stack
- **Backend:** Node.js  
- **Language:** JavaScript  

## Installation
```bash
# Clone the repository
git clone https://github.com/username/mz-folder-track-service.git

# Navigate into the project directory
cd mz-folder-track-service

# Install dependencies
npm install

# Start the service
node index.js
