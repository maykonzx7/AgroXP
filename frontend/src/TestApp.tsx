import React from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';

// Componente de teste simples
const TestRegisterPage = () => {
  return (
    <div>
      <h1>Página de Registro - Teste</h1>
      <p>Se você está vendo esta página, as rotas estão funcionando corretamente.</p>
      <Link to="/login">Ir para Login</Link>
    </div>
  );
};

const TestLoginPage = () => {
  return (
    <div>
      <h1>Página de Login - Teste</h1>
      <p>Se você está vendo esta página, as rotas estão funcionando corretamente.</p>
      <Link to="/register">Ir para Registro</Link>
    </div>
  );
};

// Componente principal de teste
const TestApp = () => {
  return (
    <div>
      <h1>Teste de Rotas</h1>
      <Routes>
        <Route path="/register" element={<TestRegisterPage />} />
        <Route path="/login" element={<TestLoginPage />} />
        <Route path="/" element={<div><h1>Página Inicial</h1><Link to="/register">Ir para Registro</Link></div>} />
      </Routes>
    </div>
  );
};

export default TestApp;