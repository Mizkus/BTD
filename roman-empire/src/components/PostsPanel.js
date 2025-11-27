import { useContext, useEffect, useMemo, useState } from 'react';
import ImageInverter from './ImageInverter';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const POSTS_URL = 'http://127.0.0.1:8000/posts';

const PostsPanel = () => {
  const { auth } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [axiosPosts, setAxiosPosts] = useState([]);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    if (!auth.token) return;
    fetch(POSTS_URL, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then((res) => res.json())
      .then(setPosts)
      .catch((error) => console.error('Fetch error:', error));

    axios
      .get(POSTS_URL)
      .then((res) => setAxiosPosts(res.data))
      .catch((error) => console.error('Axios error:', error));
  }, [auth.token]);

  const visibleFetchPosts = useMemo(
    () => posts.slice(0, limit),
    [posts, limit]
  );

  const visibleAxiosPosts = useMemo(
    () => axiosPosts.slice(0, limit),
    [axiosPosts, limit]
  );

  return (
    <article>
      <h1>Посты</h1>
      <p>Сравнение загрузки данных через fetch и axios.</p>

      <label htmlFor="post-range">
        Количество постов: <strong>{limit}</strong>
      </label>
      <input
        id="post-range"
        type="range"
        min="1"
        max="20"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
      />

      <section>
        <h2 className="subheading">Fetch</h2>
        {visibleFetchPosts.map((post) => (
          <article key={`fetch-${post.id}`}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="subheading">Axios</h2>
        {visibleAxiosPosts.map((post) => (
          <article key={`axios-${post.id}`}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </article>
        ))}
      </section>

      <ImageInverter />
    </article>
  );
};

export default PostsPanel;
