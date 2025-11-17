import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Leaf, Mail, Sun, Moon } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { settings, toggleDarkMode } = useAppSettings();

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate password reset process
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-muted/20 dark:to-background p-4">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleDarkMode}
          className="bg-card hover:bg-muted border-border"
        >
          {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4 shadow-lg">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AgroXP</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão Agropecuária
          </p>
        </div>
        
        <Card className="shadow-xl border border-border bg-card">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              {isSubmitted ? "Verifique seu e-mail" : "Esqueceu sua senha?"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {isSubmitted 
                ? "Enviamos instruções para redefinir sua senha para o seu e-mail." 
                : "Insira seu e-mail para receber instruções de redefinição de senha."}
            </CardDescription>
          </CardHeader>
          
          {isSubmitted ? (
            <CardContent className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-muted-foreground mb-6">
                Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Voltar para o login
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Enviaremos um link para redefinir sua senha para o endereço de e-mail acima.
                </p>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar instruções"
                  )}
                </Button>
                
                <div className="text-center text-sm">
                  <Link 
                    to="/login" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Voltar para o login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 AgroXP. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;