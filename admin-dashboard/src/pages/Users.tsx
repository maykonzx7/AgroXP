import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Download
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'

interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin' | 'super_admin'
  tenantId: number | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de usuários
    const loadUsers = async () => {
      setLoading(true)
      // Em uma implementação real, isso seria uma chamada à API
      setTimeout(() => {
        setUsers([
          {
            id: 1,
            name: 'João Silva',
            email: 'joao@fazendateste.com.br',
            role: 'user',
            tenantId: 1,
            isActive: true,
            lastLogin: '2023-10-15T10:30:00Z',
            createdAt: '2023-01-15T08:00:00Z'
          },
          {
            id: 2,
            name: 'Maria Santos',
            email: 'maria@admin.com.br',
            role: 'admin',
            tenantId: null,
            isActive: true,
            lastLogin: '2023-10-16T14:22:00Z',
            createdAt: '2022-11-20T09:15:00Z'
          },
          {
            id: 3,
            name: 'Carlos Oliveira',
            email: 'carlos@superadmin.com.br',
            role: 'super_admin',
            tenantId: null,
            isActive: true,
            lastLogin: '2023-10-16T16:45:00Z',
            createdAt: '2022-05-10T11:30:00Z'
          },
          {
            id: 4,
            name: 'Ana Costa',
            email: 'ana@fazendaexemplo.com.br',
            role: 'user',
            tenantId: 2,
            isActive: false,
            lastLogin: null,
            createdAt: '2023-03-22T13:45:00Z'
          }
        ])
        setLoading(false)
      }, 1000)
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const handleDeleteUser = (userId: number) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

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
                <option value="all">Todos os perfis</option>
                <option value="user">Usuários</option>
                <option value="admin">Administradores</option>
                <option value="super_admin">Super Admins</option>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
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
                        user.role === 'super_admin' ? 'destructive' :
                        user.role === 'admin' ? 'default' : 'secondary'
                      }>
                        {user.role === 'super_admin' ? 'Super Admin' :
                         user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.tenantId ? `Fazenda ${user.tenantId}` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
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
        </CardContent>
      </Card>
    </div>
  )
}

export default Users