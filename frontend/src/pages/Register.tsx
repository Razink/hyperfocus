import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username && !email) {
      return;
    }
    try {
      await register(name, password, username || undefined, email || undefined);
      navigate('/subjects');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-display">Hyperfocus</h1>
          <p className="text-gray-600 mt-2">Crée ton compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom d'utilisateur"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nizar"
          />

          <Input
            label="Prénom"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton prénom"
            required
          />

          <Input
            label="Email (optionnel)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton-email@exemple.com"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={4}
          />

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
};
