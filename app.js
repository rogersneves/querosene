const App = () => {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [posts, setPosts] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [votes, setVotes] = React.useState({});

  React.useEffect(() => {
    fetch('api/posts.php?page=' + page)
      .then(r => r.json())
      .then(data => {
        if (page === 1) {
          setPosts(data);
        } else {
          setPosts([...posts, ...data]);
        }
      })
      .catch(e => console.log(e));
  }, [page]);

  React.useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    if (query.trim()) {
      fetch('api/search.php?q=' + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => setPosts(data))
        .catch(e => console.log(e));
    } else {
      setPage(1);
    }
  };

  const handleVote = (postId, voteType) => {
    fetch('api/vote.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, voteType })
    })
      .then(r => r.json())
      .then(data => {
        setVotes({ ...votes, [postId]: { ...votes[postId], [voteType]: data.count } });
      })
      .catch(e => console.log(e));
  };

  const handleLogin = (email, password) => {
    fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setCurrentPage('home');
        } else {
          alert('Erro no login');
        }
      })
      .catch(e => console.log(e));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  return (
    <div className="app">
      {currentPage === 'home' ? (
        <>
          <Header searchQuery={searchQuery} onSearch={handleSearch} />
          <Feed posts={posts} votes={votes} onVote={handleVote} onLoadMore={() => setPage(page + 1)} />
        </>
      ) : currentPage === 'admin' ? (
        user?.type === 'Admin' ? (
          <Admin user={user} onLogout={handleLogout} />
        ) : (
          <div className="text-center p-5">Acesso negado</div>
        )
      ) : currentPage === 'login' ? (
        <Login onLogin={handleLogin} />
      ) : null}
    </div>
  );
};

const Header = ({ searchQuery, onSearch }) => {
  return (
    <div className="header sticky-top bg-white border-bottom">
      <div className="container-xxl d-flex justify-content-between align-items-center p-3">
        <h1 className="logo">Social Feed</h1>
        <input
          type="text"
          className="search-input form-control"
          placeholder="Pesquisar posts"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="btn btn-sm btn-primary">Admin</button>
      </div>
    </div>
  );
};

const Feed = ({ posts, votes, onVote, onLoadMore }) => {
  return (
    <div className="feed container-xxl py-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} votes={votes[post.id] || {}} onVote={onVote} />
      ))}
      <button className="btn btn-outline-primary" onClick={onLoadMore}>Carregar mais</button>
    </div>
  );
};

const PostCard = ({ post, votes, onVote }) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">{post.title}</h5>
        <div className="post-content mb-3">
          {post.type === 'social' ? (
            <div dangerouslySetInnerHTML={{ __html: post.embed }} />
          ) : post.type === 'image' ? (
            <img src={post.url} alt={post.title} style={{ maxWidth: '100%', maxHeight: '400px' }} />
          ) : post.type === 'video' ? (
            <video controls style={{ maxWidth: '100%', maxHeight: '600px' }}><source src={post.url} /></video>
          ) : null}
        </div>
        <p className="text-muted">Publicado em: {new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
        <div className="vote-buttons">
          <button className="btn btn-success me-2" onClick={() => onVote(post.id, 'like')}>
            Gostei ({votes.like || 0})
          </button>
          <button className="btn btn-danger" onClick={() => onVote(post.id, 'dislike')}>
            Não gostei ({votes.dislike || 0})
          </button>
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2>Login</h2>
          <input type="email" className="form-control mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="form-control mb-3" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-primary" onClick={() => onLogin(email, password)}>Entrar</button>
        </div>
      </div>
    </div>
  );
};

const Admin = ({ user, onLogout }) => {
  return (
    <div className="container mt-5">
      <h2>Admin</h2>
      <p>Bem-vindo, {user.name}</p>
      <button className="btn btn-danger" onClick={onLogout}>Sair</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
