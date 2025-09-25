import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const HomePage = () => (
  <div>
    <h1>Página Inicial</h1>
    <nav>
      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Registro</Link></li>
      </ul>
    </nav>
  </div>
);

const LoginPage = () => (
  <div>
    <h1>Página de Login</h1>
    <p><Link to="/register">Não tem uma conta? Registre-se</Link></p>
    <p><Link to="/">Voltar para home</Link></p>
  </div>
);

const RegisterPage = () => (
  <div>
    <h1>Página de Registro</h1>
    <p><Link to="/login">Já tem uma conta? Faça login</Link></p>
    <p><Link to="/">Voltar para home</Link></p>
  </div>
);

const TestApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

// Renderizar o app de teste
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<TestApp />);