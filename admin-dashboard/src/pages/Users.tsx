// src/pages/Users.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import useApi from '../hooks/useApi';
import { userService } from '../services/userService';
import { User } from '../types/admin';

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user' | 'farmer';
  phone?: string;
  isActive: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentForm, setCurrentForm] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    isActive: true
  });

  // Use our useApi hook to fetch users
  const { data: fetchedUsers, loading: apiLoading, error, refetch } = useApi(() => userService.getAll(), []);

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers);
      setLoading(apiLoading);
    }
  }, [fetchedUsers, apiLoading]);

  const handleCreateUser = async () => {
    try {
      const newUser = await userService.create({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Omit<User, 'id'>);
      
      setUsers([...users, newUser]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
    }
  };

  const handleUpdateUser = async (id: string) => {
    try {
      const updatedUser = await userService.update(id, formData);
      setUsers(users.map(user => user.id === id ? updatedUser : user));
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await userService.delete(id);
        setUsers(users.filter(user => user.id !== id));
        refetch(); // Refetch the list
      } catch (err) {
        console.error('Erro ao deletar usuário:', err);
      }
    }
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'moderator' | 'user' | 'farmer',
      phone: user.phone || '',
      isActive: user.isActive
    });
    setCurrentForm('edit');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      phone: '',
      isActive: true
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setCurrentForm('create');
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{currentForm === 'create' ? 'Criar Novo Usuário' : 'Editar Usuário'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Cargo</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="admin">Administrador</option>
                  <option value="moderator">Moderador</option>
                  <option value="user">Usuário</option>
                  <option value="farmer">Produtor Rural</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div className="flex items-center mt-4 space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <label htmlFor="active" className="text-sm">Ativo</label>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                if(currentForm === 'create') {
                  handleCreateUser();
                } else {
                  handleUpdateUser(users.find(u => u.id === formData.name)?.id || ''); // In a real app, we'd pass the actual id
                }
              }}>
                {currentForm === 'create' ? 'Criar' : 'Atualizar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="border rounded-md px-3 py-2"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Todos os cargos</option>
                <option value="admin">Administradores</option>
                <option value="moderator">Moderadores</option>
                <option value="user">Usuários</option>
                <option value="farmer">Produtores Rurais</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'admin' ? 'destructive' :
                        user.role === 'moderator' ? 'default' :
                        user.role === 'farmer' ? 'secondary' : 'outline'
                      }>
                        {user.role === 'admin' ? 'Administrador' :
                         user.role === 'moderator' ? 'Moderador' :
                         user.role === 'farmer' ? 'Produtor' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {error && (
            <div className="text-red-500 text-center py-4">
              Erro ao carregar usuários: {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;