import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Eye, EyeOff, Mail, Sun, Moon } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { settings, toggleDarkMode } = useAppSettings();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Redirect to dashboard after successful login
        navigate('/');
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err: any) {
      // Tratar mensagens de erro específicas
      if (err.message && err.message.includes('invalid credentials')) {
        setError('Credenciais inválidas. Por favor, verifique seu email e senha.');
      } else if (err.message && err.message.includes('not found')) {
        setError('Conta não encontrada. Por favor, verifique seu email.');
      } else {
        setError('Ocorreu um erro durante o login. Por favor, tente novamente.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleDarkMode}
          className="bg-white dark:bg-gray-800"
        >
          {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AgroXP</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sistema de Gestão Agropecuária
          </p>
        </div>
        
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
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
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar-me
                  </Label>
                </div>
                
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Não tem uma conta?{' '}
                </span>
                <Link 
                  to="/register" 
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                >
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2023 AgroXP. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;