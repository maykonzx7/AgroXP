// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Leaf, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await register(name, email, password, 'admin', phone);

      if (success) {
        setSuccess(true);
        setError('');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Falha no registro. O email pode já estar em uso ou ocorreu um erro no servidor.');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o registro. Por favor, tente novamente.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AgroXP Admin</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Painel administrativo do sistema
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Registro bem-sucedido!</CardTitle>
              <CardDescription className="text-center">
                Sua conta foi criada com sucesso. Redirecionando para o login...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">
                Usuário criado com sucesso!
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 AgroXP. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AgroXP Admin</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Painel administrativo do sistema
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Crie sua conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para criar sua conta de administrador
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefone (opcional)
                </label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className=""
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full btn-primary text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{' '}
                <a 
                  href="/login" 
                  className="font-medium text-green-600 hover:text-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  Faça login
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 AgroXP. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;