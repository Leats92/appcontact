import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Contacts from './pages/Contacts';
import { getToken, logout } from './api';

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const token = getToken();
  return (
    <div className="container">
      <nav className="nav">
        <div className="left">
          <Link to="/contacts">Contacts</Link>
        </div>
        <div className="right">
          {token ? (
            <button
              className="btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Déconnexion
            </button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/contacts"
          element={
            <PrivateRoute>
              <Contacts />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? '/contacts' : '/login'} replace />} />
      </Routes>
    </div>
  );
}
