import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { askNotificationPermission, unsubscribeFromPushNotifications, sendPushNotification } from './utils/pushNotification';

const API_BASE_URL = 'https://pwa-app-server.leconghau.id.vn/api';  // Thay bằng domain thật nếu deploy

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts?page=1&limit=10`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Link to="/push-notification">pushNotification demo</Link>
      <br />
      <Link to="/camera-access">Camera access</Link>
      <br />
      <Link to="/location-access">Location access</Link>
      <h1>My PWA Blog</h1>
      <h2>Posts</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts?.length > 0 && posts.map(post => (
          <li key={post.id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
            <img src={post.image} alt={post.title} style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
            <h3>{post.title}</h3>
            <Link to={`/post/${post.id}`}>Read More</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetchPostDetails();
  }, []);

  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  if (!post) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>{post.title}</h1>
      <img src={post.image} alt={post.title} style={{ width: '100%', maxWidth: '500px', borderRadius: '5px' }} />
      <p>{post.content}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

function NotificationManager() {
  const [title, setTitle] = useState('Hello!');
  const [message, setMessage] = useState('This is a test notification.');
  const [url, setUrl] = useState('https://your-website.com'); // Default URL

  const sendNotification = async () => {
    if (!title || !message || !url) {
      alert('⚠️ Please enter title, message, and URL.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notification/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, url }),
      });

      const data = await response.json();
      console.log('📩 Notification Response:', data);
      alert('🔔 Notification Sent!');

    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      alert('⚠️ Error sending notification.');
    }
  };

  return (
    <div className="App">
      <h1>🔥 Web Push Notifications</h1>

      <button onClick={askNotificationPermission}>Subcribe Notifications</button>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Notification Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Notification URL (e.g., https://your-website.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={sendNotification}>Send Notification</button>
      </div>
    </div>
  );
}

function CameraAccess() {
  const [hasPermission, setHasPermission] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setHasPermission(false);
        console.error("Error accessing the webcam: ", err);
      }
    };

    startWebcam();

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="App">
      <h1>Webcam App</h1>
      {!hasPermission ? (
        <p>Permission to access webcam is denied.</p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="100%"
            height="auto"
            style={{ border: "1px solid #ccc" }}
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{ border: "1px solid #ccc", display: "none" }}
          />
          <button onClick={takeSnapshot}>Take Snapshot</button>
        </>
      )}
    </div>
  );
}

function LocationAccess() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if the browser supports Geolocation API
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError("Unable to access your location.");
          console.error(err);
        }
      );
    } else {
      setError("Your browser does not support the Geolocation API.");
    }
  }, []);

  return (
    <div className="App">
      <h1>GPS Location in PWA</h1>
      {error && <p>{error}</p>}
      {!error && location.latitude && location.longitude ? (
        <div>
          <p>Your current location:</p>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      ) : (
        <p>Getting location...</p>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/push-notification" element={<NotificationManager />} />
        <Route path="/camera-access" element={<CameraAccess />} />
        <Route path="/location-access" element={<LocationAccess />} />
      </Routes>
    </Router>
  );
}

export default App;
