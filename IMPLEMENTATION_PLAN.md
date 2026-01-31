# Plano de Implementação - MAF Community

Este documento detalha o plano de ação para implementar todos os requisitos do PRD do MAF Community.

## 1. Análise de Gaps (Gap Analysis)

| Área | Requisito PRD | Estado Atual | Ação Necessária |
|------|----------------|--------------|-----------------|
| **Autenticação** | Cadastro com status PENDING | Implementado | OK |
| **Autenticação** | Bloqueio total até validação | Implementado via AppLayout e RLS | Verificar middleware para redirecionamento global |
| **Perfil** | Campos: Nome, Foto, Bio, Cidade | Parcial (Falta Cidade) | Adicionar coluna `city` ao banco e atualizar UI |
| **Feed** | Hashtags, Busca, Filtros | Básico (Sem hashtags ou busca) | Implementar busca e suporte a hashtags |
| **Feed** | Curtidas e Comentários | Básico | Melhorar UI e realtime |
| **Validação** | Webhook Hotmart Completo | Parcial (Lógica básica) | Revisar lógica de cancelamento/reembolso e testar fluxo |
| **Validação** | Manual (Upload Certificado) | Implementado | OK |
| **Moderação** | Sistema de Denúncias | Tabela existe, UI inexistente | Criar UI de denúncia (Front) e Painel de Moderação (Admin) |
| **Admin** | Gestão de Usuários | Implementado | Melhorar filtros e detalhes |
| **Admin** | Gestão de Conteúdos | Inexistente | Criar painel para remover posts/comentários |
| **Admin** | Auditoria/Logs | Inexistente | (Opcional MVP) Adicionar logs básicos |
| **Biblioteca** | Upload Admin, Tipos variados | Implementado (Materials) | Melhorar UI de admin para upload |
| **Segurança** | RLS e Links assinados | RLS Implementado | Verificar storage buckets e policies |

## 2. Roadmap de Implementação

### Fase 1: Core & Estabilidade (Prioridade Alta)
- [ ] **Banco de Dados**: Adicionar campo `city` na tabela `profiles`.
- [ ] **Validação**: Revisar e fortalecer Webhook Hotmart (Fluxo REVOKED/ACTIVE).
- [ ] **Segurança**: Garantir que usuários bloqueados não acessem NADA via Middleware/Layout.

### Fase 2: Funcionalidades do Feed (Prioridade Média)
- [ ] **UI**: Melhorar componente de Post (avatar, data, ações).
- [ ] **Interatividade**: Implementar Lógica de Likes (Optimistic UI).
- [ ] **Conteúdo**: Implementar suporte a Hashtags (extração e filtro).

### Fase 3: Moderação e Segurança (Prioridade Alta para Launch)
- [ ] **Denúncias**: Criar modal de denúncia no post/comentário.
- [ ] **Admin**: Criar aba de "Moderação" no painel admin para ver denúncias.
- [ ] **Admin**: Permitir admin deletar qualquer post.

### Fase 4: Refinamento UX/UI (Ongoing)
- [ ] **Perfil**: Permitir edição completa do perfil (incluindo cidade).
- [ ] **Feedback**: Melhores mensagens de erro e sucesso (Torradas/Toasts).

## 3. Detalhamento Técnico

### 3.1 Migração de Banco (Cidade)
Criar migration para adicionar `city` em `profiles`.

### 3.2 Moderação
- Criar server action ou API route para criar `report`.
- Criar página `/admin/reports` para listar e agir sobre denúncias.

### 3.3 Feed
- Adicionar campo de busca no topo do Feed.
- Filtrar posts por query SQL (ilike).

---
**Próximo Passo Imediato**: Executar Fase 1 (Migration e Verificação de Segurança).
