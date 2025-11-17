import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Code, 
  Database, 
  Layers, 
  Zap, 
  Shield, 
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Package,
  Users,
  Wallet,
  Sprout,
  MapPin,
  BarChart3,
  Settings,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const DocumentationTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Visão Geral do Sistema',
      icon: <Info className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Sobre o AgroXP</h4>
            <p className="text-sm text-muted-foreground mb-4">
              O AgroXP é um sistema completo de gestão agrícola desenvolvido para ajudar produtores 
              rurais a gerenciar suas operações de forma eficiente e profissional.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Funcionalidades Principais</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Gestão de Parcelas e Terras</li>
              <li>Controle de Culturas e Plantios</li>
              <li>Gestão de Pecuária</li>
              <li>Controle de Inventário</li>
              <li>Gestão Financeira</li>
              <li>Dashboard com Estatísticas</li>
              <li>Relatórios e Exportação de Dados</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Versão</h4>
            <Badge variant="outline">v1.0.0</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'architecture',
      title: 'Arquitetura do Sistema',
      icon: <Layers className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Estrutura de Pastas</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-xs space-y-1">
              <div>frontend/src/</div>
              <div className="ml-4">├── features/          # Features organizadas por domínio</div>
              <div className="ml-8">├── crops/            # Gestão de culturas</div>
              <div className="ml-8">├── parcels/          # Gestão de parcelas</div>
              <div className="ml-8">├── inventory/        # Gestão de inventário</div>
              <div className="ml-8">├── finance/           # Gestão financeira</div>
              <div className="ml-8">├── livestock/        # Gestão de pecuária</div>
              <div className="ml-8">└── dashboard/         # Dashboard</div>
              <div className="ml-4">├── shared/            # Código compartilhado</div>
              <div className="ml-8">├── components/        # Componentes reutilizáveis</div>
              <div className="ml-8">└── services/          # Serviços compartilhados</div>
              <div className="ml-4">├── pages/             # Páginas da aplicação</div>
              <div className="ml-4">├── contexts/          # Contextos React</div>
              <div className="ml-4">└── hooks/             # Hooks customizados</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Padrão Feature-Based</h4>
            <p className="text-sm text-muted-foreground mb-2">
              O sistema está organizado por features (domínios), onde cada feature contém:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>components/</strong> - Componentes específicos da feature</li>
              <li><strong>services/</strong> - Serviços e lógica de negócio</li>
              <li><strong>hooks/</strong> - Hooks customizados</li>
              <li><strong>types/</strong> - Definições TypeScript</li>
              <li><strong>pages/</strong> - Páginas relacionadas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Sincronização Automática</h4>
            <p className="text-sm text-muted-foreground">
              Todas as operações CRUD (Create, Read, Update, Delete) sincronizam automaticamente 
              com o banco de dados. Após cada operação bem-sucedida, o sistema atualiza 
              automaticamente todos os módulos.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Funcionalidades por Módulo',
      icon: <Package className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Gestão de Parcelas</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              <li>Cadastro e edição de parcelas</li>
              <li>Visualização em mapa</li>
              <li>Gestão de culturas por parcela</li>
              <li>Histórico de atividades</li>
              <li>Upload de fotos</li>
            </ul>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Gestão de Culturas</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              <li>Cadastro de culturas específicas</li>
              <li>Planejamento de cultivos</li>
              <li>Lista de tarefas por cultura</li>
              <li>Ficha técnica de culturas</li>
              <li>Controle de plantio e colheita</li>
            </ul>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Gestão de Pecuária</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              <li>Cadastro de animais</li>
              <li>Controle de alimentação</li>
              <li>Registro de vacinações</li>
              <li>Gestão de reprodução</li>
              <li>Controle de suprimentos veterinários</li>
            </ul>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Gestão de Inventário</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              <li>Controle de estoque</li>
              <li>Alertas de estoque baixo</li>
              <li>Histórico de transações</li>
              <li>Estatísticas por categoria</li>
              <li>Importação/Exportação de dados</li>
            </ul>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Gestão Financeira</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              <li>Registro de receitas e despesas</li>
              <li>Categorização de transações</li>
              <li>Relatórios financeiros</li>
              <li>Gráficos e análises</li>
              <li>Projeções e planejamento</li>
            </ul>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Dashboard</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              <li>Visão geral do sistema</li>
              <li>Estatísticas em tempo real</li>
              <li>Alertas e notificações</li>
              <li>Gráficos interativos</li>
              <li>Resumo de atividades</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'services',
      title: 'Serviços e APIs',
      icon: <Code className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Serviços por Feature</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Cada feature possui um serviço unificado que encapsula todas as operações:
            </p>
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">useCropService()</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <code className="text-xs bg-muted p-2 rounded block">
                    {`const cropService = useCropService();
cropService.getAll();
cropService.create(data);
cropService.update(id, updates);
cropService.delete(id);`}
                  </code>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">useParcelService()</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <code className="text-xs bg-muted p-2 rounded block">
                    {`const parcelService = useParcelService();
parcelService.getAll();
parcelService.create(data);
parcelService.update(id, updates);
parcelService.delete(id);`}
                  </code>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contexto CRM</h4>
            <p className="text-sm text-muted-foreground mb-2">
              O sistema utiliza um contexto CRM centralizado que gerencia:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sincronização automática de dados</li>
              <li>Gerenciamento de estado global</li>
              <li>Operações CRUD unificadas</li>
              <li>Importação/Exportação de dados</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'database',
      title: 'Banco de Dados',
      icon: <Database className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">ORM: Prisma</h4>
            <p className="text-sm text-muted-foreground mb-2">
              O sistema utiliza Prisma como ORM principal para acesso ao banco de dados.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Módulos do Banco</h4>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline">parcelles</Badge>
              <Badge variant="outline">cultures</Badge>
              <Badge variant="outline">livestock</Badge>
              <Badge variant="outline">inventaire</Badge>
              <Badge variant="outline">finances</Badge>
              <Badge variant="outline">harvest</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Sincronização</h4>
            <p className="text-sm text-muted-foreground">
              Todas as operações CRUD são automaticamente sincronizadas com o banco de dados. 
              O sistema mantém os dados locais e remotos sempre atualizados.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Segurança e Autenticação',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Autenticação</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Login com email e senha</li>
              <li>Registro de novos usuários</li>
              <li>Recuperação de senha</li>
              <li>Tokens JWT para sessões</li>
              <li>Rotas protegidas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Autorização</h4>
            <p className="text-sm text-muted-foreground">
              Apenas usuários autenticados podem acessar as funcionalidades do sistema. 
              A documentação também está protegida e só é acessível para usuários logados.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Dados do Usuário</h4>
            <p className="text-sm text-muted-foreground">
              Cada usuário possui seus próprios dados isolados. O sistema suporta 
              multi-tenancy, onde cada fazenda tem seus dados separados.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'best-practices',
      title: 'Boas Práticas',
      icon: <CheckCircle2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Desenvolvimento</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sempre use os serviços das features em vez de chamar APIs diretamente</li>
              <li>Utilize o contexto CRM para operações de dados</li>
              <li>Siga a estrutura de pastas por feature</li>
              <li>Mantenha componentes pequenos e focados</li>
              <li>Use TypeScript para type safety</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Performance</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>A sincronização automática evita múltiplas chamadas desnecessárias</li>
              <li>Use memoização para componentes pesados</li>
              <li>Implemente lazy loading para rotas</li>
              <li>Otimize imagens e assets</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Manutenção</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Documente código complexo</li>
              <li>Mantenha testes atualizados</li>
              <li>Revise código antes de fazer merge</li>
              <li>Siga os padrões estabelecidos</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'Solução de Problemas',
      icon: <AlertCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Problemas Comuns</h4>
            
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Dados não sincronizam</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  Verifique se está usando os métodos do contexto CRM (addData, updateData, deleteData). 
                  A sincronização é automática quando você usa esses métodos.
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Erro ao salvar dados</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  Verifique sua conexão com a internet e se o backend está rodando. 
                  Verifique também os logs do console para mais detalhes.
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Componente não encontrado</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  Verifique se o import está usando o caminho correto. Use caminhos absolutos 
                  com @/ para imports dentro do projeto.
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Suporte</h4>
            <p className="text-sm text-muted-foreground">
              Para mais ajuda, consulte a documentação técnica ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentação do Sistema
          </CardTitle>
          <CardDescription>
            Guia completo sobre a arquitetura, funcionalidades e uso do AgroXP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na documentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {filteredSections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card>
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-primary">
                              {section.icon}
                            </div>
                            <CardTitle className="text-base">{section.title}</CardTitle>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="pt-0">
                              {section.content}
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum resultado encontrado para "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationTab;

