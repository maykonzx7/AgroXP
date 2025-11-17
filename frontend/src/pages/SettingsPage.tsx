import React, { useState, useEffect } from 'react';
import { PageLayout, PageHeader, TabContainer, type TabItem } from '@/shared/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Palette, 
  Shield, 
  Settings as SettingsIcon,
  BookOpen,
  Bell,
  Globe,
  Moon,
  Sun,
  Save
} from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentationTab } from '@/features/settings';
import { settingsApi } from '@/features/settings/services/settings.service';
import usePageMetadata from '@/hooks/use-page-metadata';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SettingsPage = () => {
  const { settings, toggleDarkMode, updateSetting } = useAppSettings();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ name: string; phone: string } | null>(null);
  
  const {
    title,
    description,
    handleTitleChange,
    handleDescriptionChange,
  } = usePageMetadata({
    defaultTitle: 'Configurações',
    defaultDescription: 'Gerencie suas preferências e configurações da conta'
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Load preferences from localStorage
  const [notifications, setNotifications] = useState(() => {
    const prefs = settingsApi.getPreferences();
    return {
      email: prefs.notifications?.email ?? true,
      push: prefs.notifications?.push ?? true,
      sms: prefs.notifications?.sms ?? false,
    };
  });

  const [language, setLanguage] = useState(() => {
    const prefs = settingsApi.getPreferences();
    return prefs.language || 'pt-BR';
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // Validações
    if (!profileData.name || profileData.name.trim() === '') {
      toast.error('O nome é obrigatório');
      return;
    }

    if (profileData.name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    // Verificar se houve mudanças
    const hasChanges = 
      (user?.name !== profileData.name.trim()) || 
      (user?.phone !== (profileData.phone?.trim() || ''));

    if (!hasChanges) {
      toast.info('Nenhuma alteração foi feita');
      return;
    }

    // Mostrar modal de confirmação
    setPendingChanges({
      name: profileData.name.trim(),
      phone: profileData.phone?.trim() || '',
    });
    setShowConfirmDialog(true);
  };

  const confirmSaveProfile = async () => {
    if (!pendingChanges) return;

    setIsSaving(true);
    setShowConfirmDialog(false);
    
    try {
      const updatedUser = await settingsApi.updateProfile({
        name: pendingChanges.name,
        phone: pendingChanges.phone,
      });
      
      // Update user in context
      if (updateUser && updatedUser && user) {
        const updatedUserData = {
          ...user,
          name: updatedUser.name || pendingChanges.name,
          phone: updatedUser.phone || pendingChanges.phone,
        };
        updateUser(updatedUserData);
        
        // Atualizar também o localStorage
        localStorage.setItem('authUser', JSON.stringify(updatedUserData));
      }
      
      toast.success('Perfil atualizado com sucesso!');
      setPendingChanges(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.message || error?.error || 'Erro ao atualizar perfil';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = () => {
    const prefs = settingsApi.getPreferences();
    settingsApi.savePreferences({
      ...prefs,
      language,
    });
    toast.success('Preferências de aparência salvas!');
  };

  const handleSaveNotifications = () => {
    const prefs = settingsApi.getPreferences();
    settingsApi.savePreferences({
      ...prefs,
      notifications,
    });
    toast.success('Preferências de notificações salvas!');
  };

  const tabs: TabItem[] = [
    {
      value: 'profile',
      label: 'Perfil',
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado por questões de segurança
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                type="tel"
              />
              <p className="text-xs text-muted-foreground">
                Opcional - Formato: (00) 00000-0000
              </p>
            </div>
            <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>
      ),
    },
    {
      value: 'appearance',
      label: 'Aparência',
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência e Tema
            </CardTitle>
            <CardDescription>
              Personalize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Alternar entre tema claro e escuro
                </p>
              </div>
              <div className="flex items-center gap-2">
                {settings.darkMode ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Idioma</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <Button onClick={handleSaveAppearance} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Preferências
            </Button>
          </CardContent>
        </Card>
      ),
    },
    {
      value: 'notifications',
      label: 'Notificações',
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações importantes por email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações no navegador
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações importantes por SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
              />
            </div>
            <Button onClick={handleSaveNotifications} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Preferências
            </Button>
          </CardContent>
        </Card>
      ),
    },
    {
      value: 'documentation',
      label: 'Documentação',
      content: <DocumentationTab />,
    },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          icon={<SettingsIcon className="h-6 w-6" />}
        />

        <TabContainer
          tabs={tabs}
          defaultValue={activeTab}
          onValueChange={setActiveTab}
        />
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alterações</DialogTitle>
            <DialogDescription>
              Você está prestes a alterar suas informações de perfil. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          {pendingChanges && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nome:</span>
                <span className="text-sm font-medium">{pendingChanges.name}</span>
              </div>
              {pendingChanges.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Telefone:</span>
                  <span className="text-sm font-medium">{pendingChanges.phone}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingChanges(null);
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SettingsPage;

