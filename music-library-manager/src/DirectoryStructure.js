import React from'react';

// Define your styles as JavaScript object
const styles = {
  container: {
    fontFamily: "'Source Sans Pro', sans-serif",
    backgroundColor: "#282c34",
    color: "#61dafb",
    padding: "20px",
    borderRadius: "8px",
    display: "block",
    textAlign: "left",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
    boxShadow: "0px 5px 10px rgba(0,0,0,0.5)",
    fontSize: '1.2em'
  },
  pre: {
    margin: 0, 
    fontFamily: "inherit"
  }
};

// Modify the styles based on the window width
if (window.innerWidth <= 768) { // 768px is a common breakpoint for tablets
  styles.container.padding = "10px";
  styles.container.fontSize = '1em';
}

const DirectoryStructure = () => {
  return (
    <div style={styles.container}>
      <pre style={styles.pre}>
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