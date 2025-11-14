// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Palette, 
  Shield, 
  Globe,
  Moon,
  Sun,
  Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
  const { darkMode, theme, toggleDarkMode, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'Administrador',
    email: 'admin@agroxp.com',
    phone: '(11) 99999-9999'
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    language: 'pt-br',
    darkMode: false,
    theme: 'green'
  });

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleSave = (section: string) => {
    if (section === 'profile') {
      // Salvar dados do perfil
      alert('Perfil atualizado com sucesso!');
    } else if (section === 'security') {
      // Salvar configurações de segurança
      if (securityData.newPassword !== securityData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }
      alert('Senha alterada com sucesso!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else if (section === 'preferences') {
      // Salvar preferências
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      alert('Preferências salvas com sucesso!');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setPreferences(prev => ({
      ...prev,
      theme: newTheme
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'account', label: 'Conta', icon: SettingsIcon },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie as configurações da sua conta e preferências
        </p>
      </div>

      {/* Navegação por abas */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit dark:bg-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="seu.email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                variant="primary" 
                onClick={() => handleSave('profile')}
              >
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Modo Escuro</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Alterne entre os modos claro e escuro
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  darkMode ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="theme" className="text-sm font-medium">Tema de Cores</label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => {
                  const newTheme = e.target.value;
                  handleThemeChange(newTheme);
                  setPreferences(prev => ({ ...prev, theme: newTheme }));
                }}
                className="border rounded-md px-3 py-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="green">Verde (Padrão AgroXP)</option>
                <option value="blue">Azul</option>
                <option value="purple">Roxo</option>
                <option value="amber">Âmbar</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                variant="primary" 
                onClick={() => handleSave('preferences')}
              >
                Salvar Aparência
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Configurações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Notificações por Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receber atualizações e notificações importantes
                </p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({...prev, notifications: !prev.notifications}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  preferences.notifications ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">Idioma</label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({...prev, language: e.target.value}))}
                className="border rounded-md px-3 py-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="pt-br">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                variant="primary" 
                onClick={() => handleSave('preferences')}
              >
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">Senha Atual</label>
              <Input
                id="currentPassword"
                type="password"
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">Nova Senha</label>
              <Input
                id="newPassword"
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nova Senha</label>
              <Input
                id="confirmPassword"
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                variant="primary" 
                onClick={() => handleSave('security')}
              >
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;