import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Users, Trash2, Power, PowerOff } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export function UserManagement() {
    const { hasPermission } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New User Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasPermission('admin')) {
            fetchUsers();
        }
    }, [hasPermission]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsCreating(true);

        try {
            await api.post('/users', { name, email, password, role });
            setSuccess('Usuário criado com sucesso!');
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar usuário');
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.put(`/users/${userId}/status`, { isActive: !currentStatus });
            // Atualizar o usuário na lista localmente para evitar uma nova requisição
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, isActive: !currentStatus } : u
            ));
        } catch (err: any) {
            console.error('Erro ao alterar status do usuário', err);
            // Mostrar um alerta ou notificação (simplificado aqui por limite de dependências)
            alert(err.response?.data?.error || 'Erro ao alterar status do usuário');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            // Remover o usuário da lista localmente
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err: any) {
            console.error('Erro ao remover usuário', err);
            alert(err.response?.data?.error || 'Erro ao deletar usuário');
        }
    };

    if (!hasPermission('admin')) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                    Você não tem permissão para acessar esta página.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Usuários</h2>
                <p className="text-slate-500">Crie e gerencie os acessos ao sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulário de Criação */}
                <Card className="md:col-span-1 border-blue-100 shadow-sm">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Novo Usuário
                        </CardTitle>
                        <CardDescription>Cadastre um novo acesso ao ERP</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
                            {success && <div className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded">{success}</div>}

                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha Temporária</Label>
                                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Nível de Acesso</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Usuário Padrão</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={isCreating}>
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Criar Usuário'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Lista de Usuários */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-slate-600" />
                            Usuários Cadastrados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                            </div>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Permissão</TableHead>
                                            <TableHead>Data Cadastro</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map(u => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                                                <TableCell className="text-slate-600 truncate max-w-[150px]">{u.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={u.isActive ? 'default' : 'secondary'} className={u.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-slate-100 text-slate-800'}>
                                                        {u.isActive ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}>
                                                        {u.role === 'admin' ? 'Admin' : 'Usuário'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 w-[120px]">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        title={u.isActive ? "Desativar" : "Reativar"}
                                                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                                                        className={u.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                                                    >
                                                        {u.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        title="Deletar"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {users.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                                                    Nenhum usuário encontrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
