import React, { useState } from 'react';
import './App.css';
import { REACT_APP_API_DOMAIN } from './config';

function App() {
  console.log(`Server: ${REACT_APP_API_DOMAIN}`);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [track, setTrack] = useState('');
  const [geniusLink, setGeniusLink] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProcessing(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${REACT_APP_API_DOMAIN}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: youtubeLink,
          artist: artist,
          album: album,
          track: track,
          geniusLink: geniusLink,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process the link');
      }

      const data = await response.json();
      setSongs([...songs, data]);
      setYoutubeLink('');
      setArtist('');
      setAlbum('');
      setTrack('');
      setGeniusLink('');
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        setErrorMessage('Failed to connect to the server. Please check your internet connection and try again.');
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleDownloadError = (error) => {
    if (error.message === '404') {
      setErrorMessage('File not found. It may have been deleted or the URL is incorrect.');
    } else {
      setErrorMessage('An error occurred while trying to download the file.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Music Library Manager</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="Enter YouTube link"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Enter Artist Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Enter Album Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            placeholder="Enter Track Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={geniusLink}
            onChange={(e) => setGeniusLink(e.target.value)}
            placeholder="Enter Genius URL for Lyrics (optional)"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Processing...' : 'Download'}
          </button>
        </form>
        {(processing || songs.length > 0) && (
          <>
            <h2 className="text-xl font-semibold mt-6">Downloaded Songs</h2>
            <ul className="space-y-2 mt-2">
              {processing && (
                <li className="flex justify-between items-center p-2 bg-gray-200 rounded animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </li>
              )}
              {songs.map((song, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-200 rounded">
                  <span>{song.title}</span>
                  <a
                    href={`${REACT_APP_API_DOMAIN}/downloaded/${song.filename}`}
                    download
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      fetch(`${REACT_APP_API_DOMAIN}/downloaded/${song.filename}`)
                        .then((res) => {
                          if (!res.ok) {
                            throw new Error(res.status);
                          }
                          return res.blob();
                        })
                        .then((blob) => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.style.display = 'none';
                          a.href = url;
                          a.download = song.filename;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                        })
                        .catch((error) => handleDownloadError(error));
                    }}
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        {errorMessage && (
          <div className="text-red-500 mt-4">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;