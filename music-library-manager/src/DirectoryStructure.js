import React from'react';

const DirectoryStructure = () => {
  return (
    <div style={{
      fontFamily: "'Source Sans Pro', sans-serif",
      backgroundColor: "#282c34",
      color: "#61dafb",
      padding: "20px",
      borderRadius: "8px",
      display: "block",
      textAlign: "left",
      whiteSpace: "pre-wrap",
      lineHeight: 1.5,
      boxShadow: "0px 5px 10px rgba(0,0,0,0.5)"
    }}>
      <pre style={{ fontSize: "1.2em", margin: 0, fontFamily: "inherit" }}>
        Artist Name
        {'\n'}
        └── Album Name
        {'\n'}
        │   ├── Track Name.mp3
        {'\n'}
        │   ├── Track Name.txt (optional lyrics)
        {'\n'}
        │   └── Track Name.webp (YouTube thumbnail)
      </pre>
    </div>
  );
};

export default DirectoryStructure;