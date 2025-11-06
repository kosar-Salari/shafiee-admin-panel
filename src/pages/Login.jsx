import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiLogin, extractToken } from '../services/authService';
import { setToken, clearToken } from '../utils/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state && location.state.from) || '/pages';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data  = await apiLogin({ username, password });
      const token = extractToken(data);
      if (!token) {
        throw new Error('توکن از سرور دریافت نشد.');
      }
      setToken(token);               // ذخیره امن محلی
      navigate(from, { replace: true });
    } catch (err) {
      clearToken();
      setError(err?.response?.data?.message || err.message || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-200 font-lahzeh">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[380px] text-right">
        <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">ورود مدیر</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">نام کاربری</label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">رمز عبور</label>
            <input
              type="password"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2 rounded-lg transition-all"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}
