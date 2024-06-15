# mp3-react-app

## Overview
`mp3-react-app` is a simple React application that allows users to download MP3 files from YouTube links. The application also supports tagging the downloaded MP3 files with metadata (artist, album, track name) and organizing the files into a Plex-friendly structure. Additionally, it can acquire and download lyrics from a provided Genius URL.

![mp3-react-app](https://raw.githubusercontent.com/JakeTurner616/mp3-react-app/f6847f4b3f3067fb48cc2c64e05dd1c12ac4d440/docs/mlm.PNG)

## Features
- Download MP3 files from YouTube links.
- Tag MP3 files with metadata: artist name, album name, track name.
- Organize downloaded files in a Plex-friendly structure.
- Optional lyrics acquisition and downloading from Genius.

## Usage

Enter the YouTube link: Paste the URL of the YouTube video you want to download.

1. Artist Name

2. Album Name

3. Track Name

4. Optional Lyrics: Enter the Genius URL for the lyrics if available.

Download: Click the "Download" button to start the process.

Output Structure:
The downloaded MP3 files will be organized in the following Plex-friendly structure:

```markdown
/Music
  /Artist Name
    /Album Name
      Track Name.mp3
```


# Development

## Installation

### Prerequisites
- Node.js
- npm or yarn
- Python (for the backend)
- Flask (for the backend)
- ffmpeg (for YouTube to MP3 conversion)
- Docker (Optional but recommended for gunicorn deployment)

### Steps

#### Testing

1. **Clone the Repository**
   ```sh
   git clone https://github.com/JakeTurner616/mp3-react-app
   cd mp3-react-app
   ```

2. **Install Frontend Dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Build and deploy for testing**
   ```sh
   npm run start
   # start the dev server
   ```

4. **Install Backend for testing**
   ```sh
   python -m venv venv
   ./venv/Scripts/activate # change depending on OS
   pip install -r requirements.txt
   ```

5. **Run the Backend dev server for testing (don't forward or proxy this!)**
   ```sh
   python backend.py (requires ffmpeg)
   # start the flask dev server manually
   ```

#### Deployment

1. **Build and deploy static site with backend domain set in .env**
   ```sh
   npm run build
   # build the production assets
   ```

2. **Install Backend for deployment**
   ```sh
   docker build -t mp3-react-app .
   docker run -p 50616:50616 mp3-react-app
   # now we can forward and/or proxy the API backend
   ```

# License
This project is licensed under the GNU GPL 3.0 License. See the [LICENSE](https://github.com/JakeTurner616/mp3-react-app/blob/master/LICENSE) file for details.
