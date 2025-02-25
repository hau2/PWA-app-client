import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://pwa-app-server.leconghau.id.vn/api';  // Thay bằng domain thật nếu deploy

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>My PWA Blog</h1>
      <h2>Posts</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map(post => (
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
