import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

// Interface para o contexto de autenticação
interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: any
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provedor de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  // Verificar se usuário está autenticado ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Validar token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password
      })

      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        setUser(response.data.user)
        setIsAuthenticated(true)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  // Função de logout
  const logout = () => {
    localStorage.removeItem('admin_token')
    delete axios.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

export default AuthContext