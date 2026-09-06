import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/endpoints';
import { SEO } from '../components/seo/SEO';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register({ name, email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <SEO title={t('auth.createAccount')} description="Trail Explorer" path="/register" noindex />
      <Card className="w-full max-w-md shadow-xl border border-slate-200/80">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">TE</span>
          </div>
          <CardTitle className="text-2xl">{t('auth.createAccount')}</CardTitle>
          <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <Input
              label={t('auth.fullName')}
              type="text"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('shuttle.processing') : t('auth.registerButton')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>{t('auth.haveAccount')}</p>
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              {t('auth.signIn')}
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
