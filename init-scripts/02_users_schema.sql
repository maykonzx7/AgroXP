-- Tabela de usuários no schema users
CREATE TABLE users.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    tenant_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões
CREATE TABLE users.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users.users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tenants (fazendas/organizações)
CREATE TABLE users.tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_user_id INTEGER REFERENCES users.users(id),
    address TEXT,
    phone VARCHAR(20),
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    next_billing_date DATE,
    trial_ends_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_tenant ON users.users(tenant_id);
CREATE INDEX idx_sessions_token ON users.sessions(token);
CREATE INDEX idx_sessions_expires ON users.sessions(expires_at);
CREATE INDEX idx_tenants_owner ON users.tenants(owner_user_id);
CREATE INDEX idx_tenants_active ON users.tenants(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON users.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();