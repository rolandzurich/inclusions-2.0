#!/bin/bash

echo "🔧 Fixe projects-Tabelle auf Server..."

# Server-Passwort
SERVER_PASS="13vor12!Asdf"
DB_PASSWORD="inclusions_secure_password_2024!"

# SQL ausführen
ssh -i ~/.ssh/inclusions_server -o StrictHostKeyChecking=no incluzone@10.55.55.155 << ENDSSH
export PGPASSWORD="$DB_PASSWORD"

echo "📊 Führe SQL aus..."
psql -h localhost -U inclusions_user -d inclusions_db -f - << 'EOSQL'
-- Erstelle Extension falls nicht vorhanden
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lösche alte Tabellen
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Erstelle projects Tabelle
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget_chf DECIMAL(12,2),
    client_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Erstelle project_tasks Tabelle
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'blocked')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    assigned_to VARCHAR(255),
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger-Funktion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_priority ON project_tasks(priority);

\echo '✓ Tabellen erstellt!'
EOSQL

echo ""
echo "📋 Prüfe Tabellen:"
psql -h localhost -U inclusions_user -d inclusions_db -c "\dt" | grep -E "(projects|project_tasks)"

ENDSSH

echo ""
echo "✅ Fertig! Teste jetzt im Browser:"
echo "http://localhost:3000/admin-v2/projects"
