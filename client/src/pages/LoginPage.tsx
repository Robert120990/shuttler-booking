import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/endpoints';
import { SEO } from '../components/seo/SEO';

export const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      login(response.data.user, response.data.token);
      
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <SEO title={t('auth.signIn')} description="Trail Explorer" path="/login" noindex />
      <Card className="w-full max-w-md shadow-xl border border-slate-200/80">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">TE</span>
          </div>
          <CardTitle className="text-2xl">{t('auth.welcomeBack')}</CardTitle>
          <CardDescription>{t('auth.signInSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('shuttle.processing') : t('auth.signIn')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>{t('auth.noAccount')}</p>
            <Link to="/register" className="text-emerald-600 hover:underline font-medium">
              {t('auth.createAccount')}
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:underline">
              {t('common.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
