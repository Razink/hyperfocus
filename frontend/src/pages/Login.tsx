import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
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
          <p className="text-gray-600 mt-2">Connecte-toi à ton compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton-email@exemple.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Inscription
          </Link>
        </p>
      </div>
    </div>
  );
};
