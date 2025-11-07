#!/bin/bash
# scripts/restore-backup.sh

# Diretório de backup (personalizável)
BACKUP_DIR="${AGROXP_BACKUP_DIR:-/home/maycolaz/AgroXP/backups}"

# Configurações do banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-agroxp_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASSWORD:-postgres}"

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [OPÇÕES] <arquivo_de_backup>"
    echo ""
    echo "Opções:"
    echo "  -h, --help         Mostra esta ajuda"
    echo "  -l, --list         Lista backups disponíveis"
    echo "  -f, --full         Restaura backup completo (padrão)"
    echo "  -s, --schema NAME  Restaura schema específico"
    echo "  -c, --config       Restaura configurações"
    echo ""
    echo "Exemplos:"
    echo "  $0 -l                           # Lista backups disponíveis"
    echo "  $0 backup_completo.sql.gz       # Restaura backup completo"
    echo "  $0 -s users backup_users.sql.gz # Restaura apenas schema de usuários"
    echo ""
}

# Função para listar backups disponíveis
list_backups() {
    echo "📋 Backups disponíveis em $BACKUP_DIR:"
    echo "====================================="
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "❌ Diretório de backup não encontrado: $BACKUP_DIR"
        return 1
    fi
    
    # Listar backups ordenados por data (mais recentes primeiro)
    ls -1t "$BACKUP_DIR"/*.gz 2>/dev/null | head -20 | while read -r backup; do
        if [ -f "$backup" ]; then
            FILENAME=$(basename "$backup")
            SIZE=$(du -h "$backup" | cut -f1)
            DATE=$(stat -c %y "$backup" | cut -d' ' -f1)
            echo "📄 $FILENAME ($SIZE) - $DATE"
        fi
    done
    
    if [ -z "$(ls -A "$BACKUP_DIR"/*.gz 2>/dev/null)" ]; then
        echo "📭 Nenhum backup encontrado"
    fi
}

# Função para restaurar backup completo
restore_full_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    echo "🔄 Restaurando backup completo: $(basename "$backup_file")"
    echo "⚠️  ATENÇÃO: Isso irá substituir todos os dados atuais!"
    
    # Confirmar restauração
    read -p "Tem certeza que deseja continuar? (sim/não): " confirm
    if [[ ! "$confirm" =~ ^[Ss]([Ii][Mm])?$ ]]; then
        echo "❌ Restauração cancelada"
        return 0
    fi
    
    # Parar serviços
    echo "⏹️  Parando serviços..."
    cd /home/maycolaz/AgroXP && docker-compose down
    
    # Exportar variáveis de ambiente para psql
    export PGPASSWORD="$DB_PASS"
    
    # Restaurar backup
    echo "📥 Restaurando banco de dados..."
    gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup restaurado com sucesso!"
    else
        echo "❌ Erro ao restaurar backup"
        # Reiniciar serviços
        cd /home/maycolaz/AgroXP && docker-compose up -d
        return 1
    fi
    
    # Reiniciar serviços
    echo "▶️  Reiniciando serviços..."
    cd /home/maycolaz/AgroXP && docker-compose up -d
    
    echo "✅ Restauração concluída!"
    return 0
}

# Função para restaurar schema específico
restore_schema() {
    local schema_name="$1"
    local backup_file="$2"
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    echo "🔄 Restaurando schema '$schema_name': $(basename "$backup_file")"
    
    # Exportar variáveis de ambiente para psql
    export PGPASSWORD="$DB_PASS"
    
    # Restaurar schema
    echo "📥 Restaurando schema..."
    gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema '$schema_name' restaurado com sucesso!"
        return 0
    else
        echo "❌ Erro ao restaurar schema '$schema_name'"
        return 1
    fi
}

# Função para restaurar configurações
restore_config() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        echo "❌ Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    echo "🔄 Restaurando configurações: $(basename "$backup_file")"
    
    # Extrair backup de configurações
    TEMP_DIR="/tmp/agroxp_restore_$(date +%s)"
    mkdir -p "$TEMP_DIR"
    
    tar -xzf "$backup_file" -C "$TEMP_DIR"
    
    if [ $? -eq 0 ]; then
        echo "📥 Restaurando arquivos de configuração..."
        
        # Copiar arquivos de configuração
        cp -r "$TEMP_DIR"/config_*/* /home/maycolaz/AgroXP/ 2>/dev/null || true
        
        # Limpar diretório temporário
        rm -rf "$TEMP_DIR"
        
        echo "✅ Configurações restauradas com sucesso!"
        return 0
    else
        echo "❌ Erro ao extrair backup de configurações"
        rm -rf "$TEMP_DIR"
        return 1
    fi
}

# Função principal
main() {
    local restore_type="full"
    local schema_name=""
    local backup_file=""
    
    # Processar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -l|--list)
                list_backups
                exit 0
                ;;
            -f|--full)
                restore_type="full"
                shift
                ;;
            -s|--schema)
                restore_type="schema"
                schema_name="$2"
                shift 2
                ;;
            -c|--config)
                restore_type="config"
                shift
                ;;
            -*)
                echo "❌ Opção desconhecida: $1"
                show_help
                exit 1
                ;;
            *)
                backup_file="$1"
                shift
                ;;
        esac
    done
    
    # Verificar se Docker está instalado
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker não encontrado. Por favor instale o Docker."
        exit 1
    fi
    
    # Verificar se Docker Compose está instalado
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose não encontrado. Por favor instale o Docker Compose."
        exit 1
    fi
    
    # Executar restauração apropriada
    case "$restore_type" in
        "full")
            if [ -z "$backup_file" ]; then
                echo "❌ Nenhum arquivo de backup especificado"
                show_help
                exit 1
            fi
            
            # Converter caminho relativo para absoluto se necessário
            if [[ "$backup_file" != /* ]]; then
                backup_file="$BACKUP_DIR/$backup_file"
            fi
            
            restore_full_backup "$backup_file"
            ;;
        "schema")
            if [ -z "$schema_name" ] || [ -z "$backup_file" ]; then
                echo "❌ Schema e arquivo de backup devem ser especificados"
                show_help
                exit 1
            fi
            
            # Converter caminho relativo para absoluto se necessário
            if [[ "$backup_file" != /* ]]; then
                backup_file="$BACKUP_DIR/$backup_file"
            fi
            
            restore_schema "$schema_name" "$backup_file"
            ;;
        "config")
            if [ -z "$backup_file" ]; then
                echo "❌ Nenhum arquivo de backup especificado"
                show_help
                exit 1
            fi
            
            # Converter caminho relativo para absoluto se necessário
            if [[ "$backup_file" != /* ]]; then
                backup_file="$BACKUP_DIR/$backup_file"
            fi
            
            restore_config "$backup_file"
            ;;
    esac
}

# Executar função principal
main "$@"