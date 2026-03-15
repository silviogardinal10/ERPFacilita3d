import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Store,
  Key,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  TestTube,
  Smartphone,
  ShoppingBasket
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface ShopeeConfig {
  shopId: string;
  partnerId: string;
  partnerKey: string;
  accessToken: string;
  refreshToken: string;
  isActive: boolean;
  sandboxMode: boolean;
}

const defaultShopeeConfig: ShopeeConfig = {
  shopId: '',
  partnerId: '',
  partnerKey: '',
  accessToken: '',
  refreshToken: '',
  isActive: false,
  sandboxMode: true,
};

// Configurações simplificadas para exemplo
export function SettingsPage() {
  const { user, changePassword } = useAuth();
  const [shopeeConfig, setShopeeConfig] = useState<ShopeeConfig>(defaultShopeeConfig);
  const [tiktokActive, setTiktokActive] = useState(false);
  const [temuActive, setTemuActive] = useState(false);

  // Estados para troca de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados de feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Atualizado para usar o backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setShopeeConfig(res.data);
        }
      } catch (e) {
        console.error('Erro ao buscar settings', e);
      }
    };
    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Salvar configurações da Shopee
  const handleSaveShopeeConfig = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      await api.put('/settings', shopeeConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  // Testar conexão com API Shopee
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Simulação de teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular sucesso se todos os campos estiverem preenchidos
      const allFieldsFilled =
        shopeeConfig.shopId &&
        shopeeConfig.partnerId &&
        shopeeConfig.partnerKey;

      setTestResult(allFieldsFilled ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Trocar senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (newPassword !== confirmPassword) {
      setSaveError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setSaveError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        setSaveSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Senha atual incorreta');
      }
    } catch {
      setSaveError('Erro ao alterar senha');
    } finally {
      setIsSaving(false);
    }
  };

  const updateShopeeField = (field: keyof ShopeeConfig, value: string | boolean) => {
    setShopeeConfig(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie suas preferências e integrações</p>
      </div>

      <Tabs defaultValue="shopee" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="shopee" className="gap-2">
            <Store className="h-4 w-4" />
            Shopee
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="gap-2">
            <Smartphone className="h-4 w-4" />
            TikTok
          </TabsTrigger>
          <TabsTrigger value="temu" className="gap-2">
            <ShoppingBasket className="h-4 w-4" />
            Temu
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Configurações da API Shopee */}
        <TabsContent value="shopee" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-orange-500" />
                    Integração Shopee
                  </CardTitle>
                  <CardDescription>
                    Configure os dados da API da Shopee para sincronização automática
                  </CardDescription>
                </div>
                <Badge
                  variant={shopeeConfig.isActive ? 'default' : 'secondary'}
                  className={shopeeConfig.isActive ? 'bg-emerald-100 text-emerald-800' : ''}
                >
                  {shopeeConfig.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {saveSuccess && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    Configurações salvas com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              {saveError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              {testResult === 'success' && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    Conexão com a API Shopee estabelecida com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              {testResult === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Não foi possível conectar à API Shopee. Verifique os dados informados.
                  </AlertDescription>
                </Alert>
              )}

              {/* Modo Sandbox */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Modo Sandbox</p>
                  <p className="text-sm text-slate-500">
                    Use o ambiente de testes da Shopee
                  </p>
                </div>
                <Switch
                  checked={shopeeConfig.sandboxMode}
                  onCheckedChange={(checked) => updateShopeeField('sandboxMode', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-id">Shop ID</Label>
                  <Input
                    id="shop-id"
                    placeholder="123456789"
                    value={shopeeConfig.shopId}
                    onChange={(e) => updateShopeeField('shopId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-id">Partner ID</Label>
                  <Input
                    id="partner-id"
                    placeholder="123456"
                    value={shopeeConfig.partnerId}
                    onChange={(e) => updateShopeeField('partnerId', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-key">Partner Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="partner-key"
                    type="password"
                    placeholder="Sua chave secreta da Shopee"
                    value={shopeeConfig.partnerKey}
                    onChange={(e) => updateShopeeField('partnerKey', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Token de acesso"
                  value={shopeeConfig.accessToken}
                  onChange={(e) => updateShopeeField('accessToken', e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  O access token é gerado automaticamente após a autorização
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-token">Refresh Token</Label>
                <Input
                  id="refresh-token"
                  type="password"
                  placeholder="Token de refresh"
                  value={shopeeConfig.refreshToken}
                  onChange={(e) => updateShopeeField('refreshToken', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={shopeeConfig.isActive}
                    onCheckedChange={(checked) => updateShopeeField('isActive', checked)}
                  />
                  <Label>Ativar integração</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>
                  <Button
                    onClick={handleSaveShopeeConfig}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-800 mb-2">Como obter as credenciais:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Acesse o <a href="https://open.shopee.com" target="_blank" rel="noopener noreferrer" className="underline">Shopee Open Platform</a></li>
                  <li>Crie uma conta de desenvolvedor</li>
                  <li>Registre um novo aplicativo</li>
                  <li>Obtenha o Partner ID e Partner Key</li>
                  <li>Autorize o aplicativo na sua loja para obter o Shop ID</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do TikTok Shop */}
        <TabsContent value="tiktok" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-indigo-500" />
                    Integração TikTok Shop
                  </CardTitle>
                  <CardDescription>
                    Configure os dados para sincronização com o TikTok Shop
                  </CardDescription>
                </div>
                <Badge
                  variant={tiktokActive ? 'default' : 'secondary'}
                  className={tiktokActive ? 'bg-emerald-100 text-emerald-800' : ''}
                >
                  {tiktokActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tt-app-key">App Key</Label>
                <Input
                  id="tt-app-key"
                  placeholder="App Key do TikTok Shop"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tt-app-secret">App Secret</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="tt-app-secret"
                    type="password"
                    placeholder="App Secret do TikTok Shop"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tiktokActive}
                    onCheckedChange={setTiktokActive}
                  />
                  <Label>Ativar integração</Label>
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações da Temu */}
        <TabsContent value="temu" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBasket className="h-5 w-5 text-orange-600" />
                    Integração Temu
                  </CardTitle>
                  <CardDescription>
                    Configure os dados para sincronização com a Temu
                  </CardDescription>
                </div>
                <Badge
                  variant={temuActive ? 'default' : 'secondary'}
                  className={temuActive ? 'bg-emerald-100 text-emerald-800' : ''}
                >
                  {temuActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="temu-client-id">Client ID</Label>
                <Input
                  id="temu-client-id"
                  placeholder="Client ID da Temu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temu-client-secret">Client Secret</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="temu-client-secret"
                    type="password"
                    placeholder="Secret Key da Temu"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={temuActive}
                    onCheckedChange={setTemuActive}
                  />
                  <Label>Ativar integração</Label>
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {saveSuccess && (
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800">
                      Senha alterada com sucesso!
                    </AlertDescription>
                  </Alert>
                )}

                {saveError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </div>

                {/* Informações do usuário logado */}
                <Separator className="my-6" />

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-medium text-slate-700 mb-2">Informações da Conta</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-500">Nome:</span> {user?.name}</p>
                    <p><span className="text-slate-500">Email:</span> {user?.email}</p>
                    <p><span className="text-slate-500">Tipo:</span> {user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                    <p><span className="text-slate-500">Provedor:</span> {user?.provider === 'email' ? 'Email' : 'Outro'}</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
