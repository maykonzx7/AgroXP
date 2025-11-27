import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Eye, EyeOff, Mail, Sun, Moon, Sparkles } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import LoginTransition from '@/components/LoginTransition';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
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
        // Mostrar transição antes de redirecionar
        setShowTransition(true);
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
        setIsLoading(false);
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
      setIsLoading(false);
    }
  };

  const handleTransitionComplete = () => {
    navigate('/');
  };

  if (showTransition) {
    return <LoginTransition onComplete={handleTransitionComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-muted/20 dark:to-background p-4 relative overflow-hidden">
      {/* Animações de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleDarkMode}
          className="bg-card hover:bg-muted border-border backdrop-blur-sm"
        >
          {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 shadow-2xl animate-bounce-subtle">
            <Leaf className="h-10 w-10 text-primary-foreground animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-slide-up">
            AgroXP
          </h1>
          <p className="text-muted-foreground mt-2 animate-slide-up delay-100">
            Sistema de Gestão Agropecuária
          </p>
        </div>
        
        <Card className="shadow-2xl border border-border bg-card/95 backdrop-blur-sm animate-slide-up delay-200">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm border border-destructive/20 animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-2 animate-fade-in delay-300">
                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2 animate-fade-in delay-400">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Lembrar-me
                  </Label>
                </div>
                
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl animate-fade-in delay-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Entrar
                    <Sparkles className="h-4 w-4" />
                  </span>
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Não tem uma conta?{' '}
                </span>
                <Link 
                  to="/register" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 AgroXP. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;