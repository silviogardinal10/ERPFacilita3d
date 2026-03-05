# Estrutura de Banco de Dados - ERP 3D Shopee

Este documento descreve a estrutura recomendada para o banco de dados do sistema ERP 3D Shopee.

## Opção 1: Estrutura SQL (Recomendada para produção)

### Tabela: `products` (Produtos)
```sql
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 5,
  manufacturing_cost DECIMAL(10,2) DEFAULT 0,
  suggested_price DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) DEFAULT 0,
  weight DECIMAL(8,2),
  dimensions_length DECIMAL(6,2),
  dimensions_width DECIMAL(6,2),
  dimensions_height DECIMAL(6,2),
  images JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `orders` (Pedidos)
```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  shopee_order_id VARCHAR(100),
  customer_id VARCHAR(36) NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  tracking_code VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `order_items` (Itens do Pedido)
```sql
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### Tabela: `customers` (Clientes)
```sql
CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `stock_movements` (Movimentações de Estoque)
```sql
CREATE TABLE stock_movements (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  type ENUM('in', 'out') NOT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(255),
  order_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Tabela: `cost_configurations` (Configurações de Custo)
```sql
CREATE TABLE cost_configurations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  filament_price DECIMAL(10,2) DEFAULT 70.00,
  filament_weight DECIMAL(8,2) DEFAULT 1000,
  printer_power_consumption DECIMAL(6,2) DEFAULT 150,
  kwh_price DECIMAL(6,4) DEFAULT 0.75,
  printer_value DECIMAL(10,2) DEFAULT 2500,
  printer_life_hours INT DEFAULT 5000,
  waste_percentage DECIMAL(5,2) DEFAULT 10.00,
  shopee_commission_percentage DECIMAL(5,2) DEFAULT 14.00,
  shopee_fixed_fee DECIMAL(6,2) DEFAULT 4.00,
  packaging_box DECIMAL(6,2) DEFAULT 2.50,
  packaging_tape DECIMAL(6,2) DEFAULT 0.50,
  packaging_bubble_wrap DECIMAL(6,2) DEFAULT 1.00,
  packaging_other DECIMAL(6,2) DEFAULT 0.50,
  profit_margin DECIMAL(5,2) DEFAULT 50.00,
  discount_percentage DECIMAL(5,2) DEFAULT 15.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Opção 2: Estrutura JSON/NoSQL (MongoDB/Firebase)

### Coleção: `products`
```json
{
  "_id": "ObjectId",
  "name": "Suporte para Celular",
  "description": "Suporte ajustável para celular",
  "sku": "SUP-001",
  "category": "Acessórios",
  "stock": {
    "quantity": 15,
    "minLevel": 5,
    "movements": [
      {
        "type": "out",
        "quantity": 2,
        "reason": "Venda #1234",
        "date": "2024-03-01T10:00:00Z"
      }
    ]
  },
  "pricing": {
    "manufacturingCost": 8.50,
    "suggestedPrice": 25.90,
    "finalPrice": 29.90
  },
  "physical": {
    "weight": 80,
    "dimensions": {
      "length": 12,
      "width": 8,
      "height": 10
    }
  },
  "images": ["url1", "url2"],
  "isActive": true,
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-03-01T00:00:00Z"
}
```

### Coleção: `orders`
```json
{
  "_id": "ObjectId",
  "orderNumber": "PED-2024-001",
  "shopeeOrderId": "240301ABC123",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 98765-4321",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01000-000"
    }
  },
  "items": [
    {
      "productId": "ObjectId",
      "productName": "Suporte para Celular",
      "quantity": 2,
      "unitPrice": 29.90,
      "totalPrice": 59.80
    }
  ],
  "financial": {
    "subtotal": 59.80,
    "shippingCost": 15.00,
    "discount": 0,
    "total": 74.80
  },
  "status": "delivered",
  "paymentStatus": "paid",
  "trackingCode": "BR123456789XX",
  "notes": "Cliente pediu embalagem para presente",
  "createdAt": "2024-03-01T00:00:00Z",
  "updatedAt": "2024-03-05T00:00:00Z"
}
```

### Coleção: `costConfigurations`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "filament": {
    "price": 70.00,
    "weight": 1000
  },
  "printer": {
    "powerConsumption": 150,
    "value": 2500,
    "lifeHours": 5000
  },
  "energy": {
    "kwhPrice": 0.75
  },
  "waste": {
    "percentage": 10
  },
  "shopee": {
    "commissionPercentage": 14,
    "fixedFee": 4.00
  },
  "packaging": {
    "box": 2.50,
    "tape": 0.50,
    "bubbleWrap": 1.00,
    "other": 0.50
  },
  "pricing": {
    "profitMargin": 50,
    "discountPercentage": 15
  },
  "updatedAt": "2024-03-01T00:00:00Z"
}
```

---

## Relacionamentos

```
products ||--o{ stock_movements : "registra"
products ||--o{ order_items : "contém"
orders ||--|{ order_items : "possui"
orders ||--o| customers : "pertence a"
orders ||--o{ stock_movements : "gera"
```

---

## Índices Recomendados

```sql
-- Para buscas rápidas de produtos
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);

-- Para consultas de estoque
CREATE INDEX idx_products_stock ON products(stock_quantity, min_stock_level);

-- Para listagem de pedidos
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_orders_shopee ON orders(shopee_order_id);

-- Para movimentações de estoque
CREATE INDEX idx_stock_product ON stock_movements(product_id);
CREATE INDEX idx_stock_date ON stock_movements(created_at);
```

---

## Backup e Manutenção

### Rotina de Backup (MySQL)
```bash
# Backup diário
mysqldump -u usuario -p senha erp_3d_shopee > backup_$(date +%Y%m%d).sql

# Backup apenas das tabelas críticas
mysqldump -u usuario -p senha erp_3d_shopee products orders customers > backup_critical_$(date +%Y%m%d).sql
```

### Limpeza de Dados Antigos
```sql
-- Arquivar pedidos antigos (mais de 2 anos)
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
DELETE FROM orders WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```
