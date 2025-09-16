import { useState } from 'react';
import { api } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOk('');
    try {
      await api.register(email, password, phone, firstName, lastName);
      setOk('Compte créé, vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <h2>Créer un compte</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Prénom
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <label>
          Nom
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>
        <label>
          Téléphone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="error">{error}</div>}
        {ok && <div className="ok">{ok}</div>}
        <button className="btn" disabled={loading}>
          {loading ? '...' : 'Créer'}
        </button>
      </form>
      <p>
        Déjà un compte ? <Link to="/login">Connexion</Link>
      </p>
    </div>
  );
}
