import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Eye, EyeOff, Mail, User, Sun, Moon, Building, Phone } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { phoneMask } from '@/utils/phoneMask';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmDescription, setFarmDescription] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { settings, toggleDarkMode } = useAppSettings();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await register(
        name, 
        email, 
        phone, 
        farmName, 
        password,
        farmLocation,
        farmDescription,
        farmSize ? parseFloat(farmSize) : undefined
      );
      
      if (success) {
        // Redirect to login after successful registration
        navigate('/login');
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    } catch (err: any) {
      // Tratar mensagens de erro específicas
      if (err.message && err.message.includes('already exists')) {
        setError('Este email já está cadastrado. Por favor, utilize outro email.');
      } else if (err.message && err.message.includes('validation')) {
        setError('Dados inválidos. Por favor, verifique os campos e tente novamente.');
      } else {
        setError('Ocorreu um erro durante o registro. Por favor, tente novamente.');
      }
      console.error('Registration error:', err);
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
            <CardTitle className="text-2xl font-bold text-center">Crie sua conta</CardTitle>
            <CardDescription className="text-center">
              Registre-se para acessar o sistema de gestão
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
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
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
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(phoneMask(e.target.value))}
                    className="pl-10"
                    required
                    maxLength={15} // Máximo de caracteres após a máscara (ex: "(11) 99999-9999" tem 15 caracteres)
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmName">Nome da propriedade *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="farmName"
                    type="text"
                    placeholder="Nome da sua fazenda ou propriedade"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmLocation">Localização da propriedade</Label>
                <Input
                  id="farmLocation"
                  type="text"
                  placeholder="Cidade, Estado"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmDescription">Descrição da propriedade</Label>
                <textarea
                  id="farmDescription"
                  placeholder="Breve descrição sobre sua propriedade (opcional)"
                  value={farmDescription}
                  onChange={(e) => setFarmDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmSize">Tamanho da propriedade (hectares)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 10.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                />
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
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
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Já tem uma conta?{' '}
                </span>
                <Link 
                  to="/login" 
                  className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                >
                  Faça login
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

export default RegisterPage;