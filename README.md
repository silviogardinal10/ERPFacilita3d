# ERP 3D Shopee

Sistema completo de gestão para vendas na Shopee com precificação de impressão 3D.

## 🚀 Demo Online

**URL:** https://kq36bswqyrap6.ok.kimi.link

## 📋 Funcionalidades

### 1. 🔐 Sistema de Autenticação
- ✅ Login com Google (OAuth)
- ✅ Login com Email/Senha
- ✅ Perfis de usuário (Admin e Usuário)
- ✅ Persistência de sessão
- ✅ Logout seguro

**Contas de demonstração:**
| Tipo | Email | Senha |
|------|-------|-------|
| Admin | `admin@erp3d.com` | `admin123` |
| Usuário | `usuario@erp3d.com` | `user123` |

### 2. ⚙️ Configurações
- ✅ Integração com API Shopee (Shop ID, Partner ID, Partner Key)
- ✅ Modo Sandbox para testes
- ✅ Teste de conexão com a API
- ✅ Troca de senha
- ✅ Dados da conta do usuário

### 3. 🖨️ Cadastro de Produtos 3D (NOVO!)
- ✅ **Nome do produto** - Identifique sua peça
- ✅ **Foto do produto** - Upload de imagem para visualização
- ✅ **Salvar produto** - Todos os dados de custo são salvos
- ✅ **Lista de produtos cadastrados** - Visualize todos os produtos
- ✅ **Carregar produto** - Recupere os dados de um produto salvo
- ✅ **Excluir produto** - Remova produtos do cadastro
- ✅ **Persistência** - Produtos salvos no navegador (localStorage)

### 4. 💰 Precificação com Seletor de Produtos (NOVO!)
- ✅ **Seletor de produtos cadastrados** - Escolha um produto do cadastro 3D
- ✅ **Busca de produtos** - Filtre produtos por nome
- ✅ **Visualização com foto** - Veja a imagem do produto selecionado
- ✅ **Custo automático** - O custo de fabricação é carregado automaticamente
- ✅ **Entrada manual** - Opcionalmente, informe o custo manualmente
- ✅ Configuração de comissão da Shopee (% e valor fixo)
- ✅ Custo de embalagem (caixa, fita, plástico bolha)
- ✅ Margem de lucro desejada
- ✅ Simulação de desconto para ofertas relâmpago
- ✅ Cálculo do preço de venda sugerido
- ✅ Análise de viabilidade (ponto de equilíbrio)

### 5. 📊 Dashboard de Vendas e Estoque
- ✅ Estatísticas de vendas e receita
- ✅ Pedidos pendentes de ação
- ✅ Produtos com estoque baixo
- ✅ Lista de pedidos recentes
- ✅ Atualização de status de pedidos

### 6. 🏷️ Impressão de Etiquetas
- ✅ Etiqueta de envio formato 10x15cm
- ✅ Nota de conteúdo configurada
- ✅ Dados do destinatário
- ✅ Lista de produtos
- ✅ QR Code placeholder
- ✅ **Impressão em massa** - Selecione múltiplos pedidos e imprima todos de uma vez
- ✅ Exportar lista de pedidos para CSV

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript
- **Estilização:** Tailwind CSS
- **Componentes UI:** shadcn/ui
- **Build:** Vite
- **Ícones:** Lucide React

## 📁 Estrutura do Projeto

```
app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx           # Tela de login
│   │   ├── calculators/
│   │   │   └── Cost3DCalculator.tsx    # Calculadora de custo 3D + Cadastro
│   │   ├── pricing/
│   │   │   └── ShopeePricing.tsx       # Precificação + Seletor de produtos
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx           # Dashboard principal
│   │   ├── labels/
│   │   │   ├── LabelPrinter.tsx        # Impressão de etiquetas
│   │   │   └── BulkLabelPrinter.tsx    # Impressão em massa
│   │   └── settings/
│   │       └── SettingsPage.tsx        # Configurações
│   ├── hooks/
│   │   ├── useAuth.ts                  # Autenticação
│   │   ├── use3DProducts.ts            # Gerenciamento de produtos 3D (NOVO)
│   │   ├── use3DCostCalculator.ts      # Lógica de cálculo 3D
│   │   ├── useShopeePricing.ts         # Lógica de precificação
│   │   ├── useProductManagement.ts     # Gestão de produtos
│   │   └── useOrderManagement.ts       # Gestão de pedidos
│   ├── types/
│   │   └── index.ts                    # Tipos TypeScript
│   ├── lib/
│   │   └── utils.ts                    # Utilitários
│   └── App.tsx                         # Componente principal
├── dist/                               # Build de produção
└── package.json
```

## 🚀 Como Usar

### Cadastrar um Produto 3D

1. Acesse a aba **"Custo 3D"**
2. Preencha os dados do produto:
   - **Nome do Produto** (obrigatório)
   - **Foto do Produto** (opcional - clique em "Adicionar Foto")
3. Preencha os dados de custo:
   - Preço e peso do rolo de filamento
   - Filamento usado (g)
   - Tempo de impressão (horas e minutos)
   - Consumo da impressora (W)
   - Preço do kWh
   - Valor da impressora e vida útil
   - Margem de segurança
4. Clique em **"Salvar Produto"**
5. O produto aparecerá na lista de "Produtos Cadastrados"

### Precificar um Produto Cadastrado

1. Acesse a aba **"Precificação"**
2. Na seção "Selecionar Produto Cadastrado":
   - Clique em **"Buscar Produto Cadastrado"**
   - Escolha o produto na lista (ou busque pelo nome)
3. O custo de fabricação será carregado automaticamente
4. Ajuste as configurações da Shopee:
   - % de comissão
   - Taxa fixa
   - Custos de embalagem
   - Margem de lucro desejada
   - % de desconto para ofertas
5. Veja o **preço de venda sugerido** e a análise de viabilidade

## 🧮 Lógica de Cálculo

### Custo de Fabricação 3D

```typescript
// Custo do filamento
const filamentCostPerGram = filamentPrice / filamentWeight;
const totalFilamentCost = filamentCostPerGram * gramsUsed;

// Custo de energia
const energyCostPerHour = (printerPower / 1000) * kwhPrice;
const totalEnergyCost = energyCostPerHour * printHours;

// Depreciação
const depreciationCostPerHour = printerValue / printerLifeHours;
const totalDepreciationCost = depreciationCostPerHour * printHours;

// Margem de segurança
const subtotal = totalFilamentCost + totalEnergyCost + totalDepreciationCost;
const wasteCost = subtotal * (wastePercentage / 100);

// Custo total
const totalManufacturingCost = subtotal + wasteCost;
```

### Precificação Shopee

```typescript
// Custo base
const baseCost = manufacturingCost + packagingCost;

// Preço sugerido
const denominator = 1 - commissionRate - marginRate;
const suggestedPrice = (baseCost + fixedFee) / denominator;

// Comissão Shopee
const shopeeCommission = suggestedPrice * commissionRate;

// Lucro
const profitAmount = suggestedPrice * marginRate;

// Preço com desconto
const priceWithDiscount = suggestedPrice * (1 - discountRate);
```

## 🔌 Integração API Shopee

Para integrar com a API da Shopee, você precisa:

1. Acesse o [Shopee Open Platform](https://open.shopee.com)
2. Crie uma conta de desenvolvedor
3. Registre um novo aplicativo
4. Obtenha o Partner ID e Partner Key
5. Autorize o aplicativo na sua loja para obter o Shop ID
6. Configure os dados na aba "Configurações" do ERP

## 📝 Próximos Passos

- [x] Sistema de autenticação de usuários
- [x] Configurações da API Shopee
- [x] Impressão em massa de etiquetas
- [x] **Cadastro de produtos 3D com foto**
- [x] **Seletor de produtos na precificação**
- [ ] Integração real com API da Shopee
- [ ] Relatórios avançados (vendas, lucros, produtos mais vendidos)
- [ ] Controle de produção (fila de impressão)
- [ ] Integração com serviços de envio (Correios, transportadoras)
- [ ] App mobile para consulta rápida
- [ ] Backup automático na nuvem

## 📄 Licença

Este projeto é privado e de uso exclusivo do desenvolvedor.

---

**Desenvolvido com ❤️ para o mercado de impressão 3D**
