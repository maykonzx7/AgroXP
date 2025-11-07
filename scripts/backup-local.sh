#!/bin/bash
# scripts/backup-local.sh

# Diretório de backup (personalizável)
BACKUP_DIR="${AGROXP_BACKUP_DIR:-/home/maycolaz/AgroXP/backups}"
# Manter backups dos últimos X dias (padrão: 30)
KEEP_DAYS="${AGROXP_KEEP_DAYS:-30}"

# Configurações do banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-agroxp_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASSWORD:-postgres}"

# Timestamp para o nome do arquivo
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d")

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

echo "🚀 Iniciando backup local do sistema AgroXP..."
echo "📂 Diretório de backup: $BACKUP_DIR"
echo "📅 Data e hora: $DATE às $(date +"%H:%M:%S")"

# Verificar se PostgreSQL está instalado
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump não encontrado. Por favor instale o cliente PostgreSQL."
    exit 1
fi

# Exportar variáveis de ambiente para pg_dump
export PGPASSWORD="$DB_PASS"

# 1. Backup completo do banco de dados
echo "💾 Realizando backup completo do banco de dados..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --clean --if-exists --no-owner --no-privileges \
  --column-inserts --rows-per-insert=100 \
  | gzip > "$BACKUP_DIR/agroxp_full_$TIMESTAMP.sql.gz"

if [ $? -eq 0 ]; then
    echo "✅ Backup completo concluído: $BACKUP_DIR/agroxp_full_$TIMESTAMP.sql.gz"
    FULL_SIZE=$(du -h "$BACKUP_DIR/agroxp_full_$TIMESTAMP.sql.gz" | cut -f1)
    echo "📦 Tamanho do backup completo: $FULL_SIZE"
else
    echo "❌ Erro ao realizar backup completo"
    exit 1
fi

# 2. Backups por schema (para recuperação seletiva)
echo "🔧 Realizando backups por schema..."

# Array de schemas importantes
SCHEMAS=("users" "farms" "parcels" "crops" "livestock" "inventory" "finance" "admin")

for schema in "${SCHEMAS[@]}"; do
    echo "💾 Backup do schema: $schema..."
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
      --clean --if-exists --no-owner --no-privileges \
      --schema="$schema" \
      | gzip > "$BACKUP_DIR/agroxp_${schema}_$TIMESTAMP.sql.gz"
    
    if [ $? -eq 0 ]; then
        SCHEMA_SIZE=$(du -h "$BACKUP_DIR/agroxp_${schema}_$TIMESTAMP.sql.gz" 2>/dev/null | cut -f1)
        echo "✅ Backup de $schema concluído (${SCHEMA_SIZE:-0B})"
    else
        echo "⚠️  Erro ou schema $schema não existe"
    fi
done

# 3. Backup de configurações importantes
echo "⚙️  Realizando backup de configurações..."
CONFIG_BACKUP_DIR="$BACKUP_DIR/config_$TIMESTAMP"
mkdir -p "$CONFIG_BACKUP_DIR"

# Copiar arquivos de configuração importantes
cp -r /home/maycolaz/AgroXP/backend/.env* "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
cp -r /home/maycolaz/AgroXP/frontend/.env* "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
cp /home/maycolaz/AgroXP/docker-compose.yml "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
cp /home/maycolaz/AgroXP/scripts/*.sh "$CONFIG_BACKUP_DIR/" 2>/dev/null || true

# Compactar configurações
tar -czf "$BACKUP_DIR/agroxp_config_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "config_$TIMESTAMP" 2>/dev/null
if [ $? -eq 0 ]; then
    CONFIG_SIZE=$(du -h "$BACKUP_DIR/agroxp_config_$TIMESTAMP.tar.gz" | cut -f1)
    echo "✅ Backup de configurações concluído ($CONFIG_SIZE)"
    # Remover diretório temporário
    rm -rf "$CONFIG_BACKUP_DIR"
else
    echo "⚠️  Erro ao compactar backup de configurações"
fi

# 4. Limpar backups antigos (manter apenas os últimos X dias)
echo "🧹 Limpando backups antigos (+$KEEP_DAYS dias)..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$KEEP_DAYS -delete

# 5. Mostrar estatísticas do backup
echo ""
echo "📊 Estatísticas do backup:"
echo "========================="
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
echo "Total de backups: $TOTAL_BACKUPS"
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Espaço total utilizado: $TOTAL_SIZE"

# 6. Verificar último backup bem-sucedido
echo ""
echo "✅ Backup local concluído com sucesso!"
echo "📁 Backups armazenados em: $BACKUP_DIR"
echo "🕒 Backup realizado em: $(date)"

# 7. Notificação opcional (se configurada)
if [ -n "$NOTIFY_WEBHOOK_URL" ]; then
    curl -X POST "$NOTIFY_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"✅ Backup AgroXP concluído - $DATE às $(date +%H:%M)\"}" \
      >/dev/null 2>&1 || true
fi

# 8. Registro no log do sistema
logger -t "agroxp-backup" "Backup concluído em $DATE às $(date +%H:%M:%S) - Tamanho: $TOTAL_SIZE"