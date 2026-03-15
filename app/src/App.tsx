import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  Tag,
  LayoutDashboard,
  Box,
  Settings,
  Menu,
  LogOut,
  Users,
  Printer,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Cost3DCalculator } from '@/components/calculators/Cost3DCalculator';
import { ShopeePricing } from '@/components/pricing/ShopeePricing';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LabelPrinter } from '@/components/labels/LabelPrinter';
import { BulkLabelPrinter } from '@/components/labels/BulkLabelPrinter';
import { PrintTab } from '@/components/dashboard/PrintTab';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { ProductsTab } from '@/components/products/ProductsTab';
import { SuppliesTab } from '@/components/supplies/SuppliesTab';
import './App.css';

// Componente principal protegido
function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [selectedProductCost, setSelectedProductCost] = useState<number>(0);

  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { orders, getOrderById } = useOrderManagement();

  // Auto-logout effect
  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 30 minutes of inactivity
      inactivityTimer = setTimeout(() => {
        if (isAuthenticated) {
          logout();
        }
      }, 30 * 60 * 1000); 
    };

    // Listeners for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    // Initial timer start
    resetTimer();

    // Event for closing/refreshing the page to optionally logout
    // For many apps, just relying on the session token expiry is enough,
    // but the request asked to logout when closing the page. 
    // Usually, sessionStorage is better for this, but since the system
    // uses localStorage currently, we'll clear it on beforeunload if we haven't checked 'remember me'.
    // However, handling beforeunload for exact 'close' versus 'refresh' is tricky. 
    // A robust way without changing the storage type is a simple event listener:
    const handleBeforeUnload = () => {
      // Removing the token on close. This will also run on refresh, 
      // requiring user to login again whenever the tab closes/refreshes.
      logout();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, logout]);

  const handlePrintLabel = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsLabelOpen(true);
  };

  const handleBulkPrint = () => {
    setIsBulkPrintOpen(true);
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProductCost(product.totalCost);
  };

  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'print', label: 'Impressão', icon: Printer },
    { id: 'calculator', label: 'Custo 3D', icon: Calculator },
    { id: 'supplies', label: 'Suprimentos', icon: Package },
    { id: 'products', label: 'Produtos', icon: Box },
    { id: 'pricing', label: 'Precificação', icon: Tag },
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'Usuários', icon: Users }] : []),
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Box className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900">ERP Facilita 3D</h1>
            <p className="text-xs text-slate-500">Gestão Multiseller</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              {user?.role === 'admin' && (
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveTab('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b px-4 py-3 pl-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Box className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">ERP Facilita 3D</h1>
            </div>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Area */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="print">Impressão</TabsTrigger>
              <TabsTrigger value="calculator">Custo 3D</TabsTrigger>
              <TabsTrigger value="supplies">Suprimentos</TabsTrigger>
              <TabsTrigger value="pricing">Precificação</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="m-0">
              <Dashboard />
            </TabsContent>

            <TabsContent value="print" className="m-0">
              <PrintTab 
                onPrintLabel={handlePrintLabel}
                onBulkPrint={handleBulkPrint}
              />
            </TabsContent>

            <TabsContent value="calculator" className="m-0">
              <Cost3DCalculator onProductSaved={() => {}} />
            </TabsContent>

            <TabsContent value="pricing" className="m-0">
              <ShopeePricing
                manufacturingCost={selectedProductCost}
                onSelectProduct={handleSelectProduct}
              />
            </TabsContent>

            <TabsContent value="supplies" className="m-0">
              <SuppliesTab />
            </TabsContent>

            <TabsContent value="products" className="m-0">
              <ProductsTab />
            </TabsContent>

            {user?.role === 'admin' && (
              <TabsContent value="users" className="m-0">
                <UserManagement />
              </TabsContent>
            )}

            <TabsContent value="settings" className="m-0">
              <SettingsPage />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Label Printer Modal */}
      {isLabelOpen && selectedOrder && (
        <LabelPrinter
          order={selectedOrder}
          onClose={() => {
            setIsLabelOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}

      {/* Bulk Label Printer Modal */}
      {isBulkPrintOpen && (
        <BulkLabelPrinter
          orders={orders}
          onClose={() => setIsBulkPrintOpen(false)}
        />
      )}
    </div>
  );
}

// App principal com Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
