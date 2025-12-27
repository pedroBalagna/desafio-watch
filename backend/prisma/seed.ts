import { PrismaClient, MovementType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ==================== USUÁRIOS ====================
  console.log('👤 Criando usuários...');
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'gerente@example.com' },
    update: {},
    create: {
      email: 'gerente@example.com',
      name: 'Gerente de Estoque',
      password: hashedPassword,
      role: UserRole.MANAGER,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'usuario@example.com' },
    update: {},
    create: {
      email: 'usuario@example.com',
      name: 'Usuário Comum',
      password: hashedPassword,
      role: UserRole.USER,
    },
  });

  console.log(
    `  ✓ Usuários criados: ${adminUser.name}, ${managerUser.name}, ${regularUser.name}`,
  );

  // ==================== CATEGORIAS ====================
  console.log('\n📁 Criando categorias...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Eletrônicos' },
      update: {},
      create: {
        name: 'Eletrônicos',
        description: 'Produtos eletrônicos e dispositivos',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Informática' },
      update: {},
      create: {
        name: 'Informática',
        description: 'Computadores, notebooks e acessórios',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Periféricos' },
      update: {},
      create: {
        name: 'Periféricos',
        description: 'Teclados, mouses, headsets e outros periféricos',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Smartphones' },
      update: {},
      create: {
        name: 'Smartphones',
        description: 'Celulares e tablets',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Games' },
      update: {},
      create: {
        name: 'Games',
        description: 'Consoles e jogos',
        isActive: true,
      },
    }),
  ]);

  console.log(`  ✓ ${categories.length} categorias criadas`);

  // ==================== FORNECEDORES ====================
  console.log('\n🏭 Criando fornecedores...');

  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { cnpj: '12.345.678/0001-90' },
      update: {},
      create: {
        name: 'TechDistribuidora Ltda',
        email: 'contato@techdist.com.br',
        phone: '(11) 3456-7890',
        address: 'Av. Paulista, 1000 - São Paulo/SP',
        cnpj: '12.345.678/0001-90',
        isActive: true,
      },
    }),
    prisma.supplier.upsert({
      where: { cnpj: '98.765.432/0001-10' },
      update: {},
      create: {
        name: 'MegaImports S.A.',
        email: 'vendas@megaimports.com',
        phone: '(21) 2345-6789',
        address: 'Rua do Comércio, 500 - Rio de Janeiro/RJ',
        cnpj: '98.765.432/0001-10',
        isActive: true,
      },
    }),
    prisma.supplier.upsert({
      where: { cnpj: '11.222.333/0001-44' },
      update: {},
      create: {
        name: 'InfoTech Componentes',
        email: 'pedidos@infotech.com.br',
        phone: '(31) 3344-5566',
        address: 'Av. Industrial, 2000 - Belo Horizonte/MG',
        cnpj: '11.222.333/0001-44',
        isActive: true,
      },
    }),
  ]);

  console.log(`  ✓ ${suppliers.length} fornecedores criados`);

  // ==================== ARMAZÉNS ====================
  console.log('\n🏢 Criando armazéns...');

  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: 'CD-SP-01' },
      update: {},
      create: {
        name: 'Centro de Distribuição SP',
        code: 'CD-SP-01',
        address: 'Av. das Nações Unidas, 12000 - São Paulo/SP',
        description: 'Centro de distribuição principal',
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: 'CD-RJ-01' },
      update: {},
      create: {
        name: 'Centro de Distribuição RJ',
        code: 'CD-RJ-01',
        address: 'Av. Brasil, 5000 - Rio de Janeiro/RJ',
        description: 'Centro de distribuição regional sudeste',
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: 'LOJA-01' },
      update: {},
      create: {
        name: 'Loja Matriz',
        code: 'LOJA-01',
        address: 'Rua Augusta, 100 - São Paulo/SP',
        description: 'Estoque da loja matriz',
        isActive: true,
      },
    }),
  ]);

  console.log(`  ✓ ${warehouses.length} armazéns criados`);

  // ==================== PRODUTOS ====================
  console.log('\n📦 Criando produtos...');

  const productsData = [
    {
      sku: 'NOTE-DELL-001',
      name: 'Notebook Dell Inspiron 15',
      description:
        'Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, SSD 256GB',
      barcode: '7891234567001',
      unitPrice: 3499.99,
      costPrice: 2899.99,
      minStock: 5,
      maxStock: 50,
      currentStock: 15,
      categoryIndex: 1, // Informática
      supplierIndex: 0, // TechDistribuidora
    },
    {
      sku: 'NOTE-LENOVO-001',
      name: 'Notebook Lenovo IdeaPad 3',
      description: 'Notebook Lenovo IdeaPad 3, AMD Ryzen 5, 8GB RAM, SSD 512GB',
      barcode: '7891234567002',
      unitPrice: 2999.99,
      costPrice: 2399.99,
      minStock: 5,
      maxStock: 40,
      currentStock: 8,
      categoryIndex: 1,
      supplierIndex: 0,
    },
    {
      sku: 'MOUSE-LOG-001',
      name: 'Mouse Logitech MX Master 3',
      description: 'Mouse sem fio Logitech MX Master 3, ergonômico',
      barcode: '7891234567003',
      unitPrice: 599.99,
      costPrice: 399.99,
      minStock: 20,
      maxStock: 200,
      currentStock: 45,
      categoryIndex: 2, // Periféricos
      supplierIndex: 1, // MegaImports
    },
    {
      sku: 'TECLADO-LOG-001',
      name: 'Teclado Logitech G Pro',
      description: 'Teclado mecânico Logitech G Pro, RGB',
      barcode: '7891234567004',
      unitPrice: 899.99,
      costPrice: 649.99,
      minStock: 15,
      maxStock: 100,
      currentStock: 3, // Estoque baixo
      categoryIndex: 2,
      supplierIndex: 1,
    },
    {
      sku: 'PHONE-IPHONE-001',
      name: 'iPhone 15 Pro 256GB',
      description: 'Apple iPhone 15 Pro, 256GB, Titânio Natural',
      barcode: '7891234567005',
      unitPrice: 9499.99,
      costPrice: 7999.99,
      minStock: 10,
      maxStock: 50,
      currentStock: 12,
      categoryIndex: 3, // Smartphones
      supplierIndex: 0,
    },
    {
      sku: 'PHONE-SAMSUNG-001',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra, 256GB, Titanium Black',
      barcode: '7891234567006',
      unitPrice: 8999.99,
      costPrice: 7499.99,
      minStock: 10,
      maxStock: 50,
      currentStock: 0, // Sem estoque
      categoryIndex: 3,
      supplierIndex: 1,
    },
    {
      sku: 'CONSOLE-PS5-001',
      name: 'PlayStation 5 Standard',
      description: 'Console Sony PlayStation 5 Standard Edition',
      barcode: '7891234567007',
      unitPrice: 4499.99,
      costPrice: 3599.99,
      minStock: 5,
      maxStock: 30,
      currentStock: 7,
      categoryIndex: 4, // Games
      supplierIndex: 0,
    },
    {
      sku: 'CONSOLE-XBOX-001',
      name: 'Xbox Series X',
      description: 'Console Microsoft Xbox Series X 1TB',
      barcode: '7891234567008',
      unitPrice: 4299.99,
      costPrice: 3499.99,
      minStock: 5,
      maxStock: 30,
      currentStock: 4, // Estoque baixo
      categoryIndex: 4,
      supplierIndex: 1,
    },
    {
      sku: 'HEADSET-HYPER-001',
      name: 'Headset HyperX Cloud II',
      description: 'Headset gamer HyperX Cloud II, 7.1 virtual',
      barcode: '7891234567009',
      unitPrice: 599.99,
      costPrice: 399.99,
      minStock: 20,
      maxStock: 150,
      currentStock: 67,
      categoryIndex: 2,
      supplierIndex: 2, // InfoTech
    },
    {
      sku: 'MONITOR-LG-001',
      name: 'Monitor LG UltraWide 29"',
      description: 'Monitor LG UltraWide 29", IPS, 75Hz',
      barcode: '7891234567010',
      unitPrice: 1299.99,
      costPrice: 999.99,
      minStock: 8,
      maxStock: 40,
      currentStock: 22,
      categoryIndex: 0, // Eletrônicos
      supplierIndex: 2,
    },
  ];

  const products = [];
  for (const productData of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        barcode: productData.barcode,
        unitPrice: new Decimal(productData.unitPrice),
        costPrice: new Decimal(productData.costPrice),
        minStock: productData.minStock,
        maxStock: productData.maxStock,
        currentStock: productData.currentStock,
        unit: 'UN',
        isActive: true,
        categoryId: categories[productData.categoryIndex].id,
        supplierId: suppliers[productData.supplierIndex].id,
      },
    });
    products.push(product);
  }

  console.log(`  ✓ ${products.length} produtos criados`);

  // ==================== NÍVEIS DE ESTOQUE ====================
  console.log('\n📊 Criando níveis de estoque por armazém...');

  // Distribuir estoque entre armazéns
  for (const product of products) {
    // CD-SP (60% do estoque)
    await prisma.stockLevel.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouses[0].id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        warehouseId: warehouses[0].id,
        quantity: Math.floor(product.currentStock * 0.6),
        minStock: Math.floor(product.minStock * 0.6),
        maxStock: product.maxStock ? Math.floor(product.maxStock * 0.6) : null,
      },
    });

    // CD-RJ (30% do estoque)
    await prisma.stockLevel.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouses[1].id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        warehouseId: warehouses[1].id,
        quantity: Math.floor(product.currentStock * 0.3),
        minStock: Math.floor(product.minStock * 0.3),
        maxStock: product.maxStock ? Math.floor(product.maxStock * 0.3) : null,
      },
    });

    // Loja Matriz (10% do estoque)
    await prisma.stockLevel.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouses[2].id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        warehouseId: warehouses[2].id,
        quantity: Math.ceil(product.currentStock * 0.1),
        minStock: Math.ceil(product.minStock * 0.1),
        maxStock: product.maxStock ? Math.ceil(product.maxStock * 0.1) : null,
      },
    });
  }

  console.log(
    `  ✓ Níveis de estoque criados para ${products.length * 3} combinações produto/armazém`,
  );

  // ==================== MOVIMENTAÇÕES DE EXEMPLO ====================
  console.log('\n📝 Criando movimentações de exemplo...');

  const movements = [
    {
      type: MovementType.IN,
      productIndex: 0,
      warehouseIndex: 0,
      quantity: 20,
      reference: 'NF-2024-0001',
      notes: 'Entrada inicial de estoque',
    },
    {
      type: MovementType.IN,
      productIndex: 1,
      warehouseIndex: 0,
      quantity: 15,
      reference: 'NF-2024-0002',
      notes: 'Reposição de estoque',
    },
    {
      type: MovementType.OUT,
      productIndex: 0,
      warehouseIndex: 2,
      quantity: 2,
      reference: 'VENDA-001',
      notes: 'Venda para cliente',
    },
    {
      type: MovementType.TRANSFER,
      productIndex: 2,
      warehouseIndex: 0,
      quantity: 10,
      reference: 'TRANSF-001',
      notes: 'Transferência para loja matriz',
    },
    {
      type: MovementType.OUT,
      productIndex: 4,
      warehouseIndex: 2,
      quantity: 1,
      reference: 'VENDA-002',
      notes: 'Venda iPhone',
    },
  ];

  for (const movementData of movements) {
    const product = products[movementData.productIndex];
    const warehouse = warehouses[movementData.warehouseIndex];

    // Buscar estoque atual
    const stockLevel = await prisma.stockLevel.findUnique({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: warehouse.id,
        },
      },
    });

    const previousStock = stockLevel?.quantity || 0;
    let newStock = previousStock;

    if (movementData.type === MovementType.IN) {
      newStock = previousStock + movementData.quantity;
    } else if (
      movementData.type === MovementType.OUT ||
      movementData.type === MovementType.TRANSFER
    ) {
      newStock = Math.max(0, previousStock - movementData.quantity);
    }

    await prisma.stockMovement.create({
      data: {
        type: movementData.type,
        quantity: movementData.quantity,
        reference: movementData.reference,
        notes: movementData.notes,
        previousStock,
        newStock,
        productId: product.id,
        warehouseId: warehouse.id,
        userId: adminUser.id,
      },
    });
  }

  console.log(`  ✓ ${movements.length} movimentações de exemplo criadas`);

  // ==================== RESUMO ====================
  console.log('\n' + '='.repeat(50));
  console.log('✅ SEED CONCLUÍDO COM SUCESSO!');
  console.log('='.repeat(50));
  console.log('\n📋 Resumo:');
  console.log(`   • ${3} usuários`);
  console.log(`   • ${categories.length} categorias`);
  console.log(`   • ${suppliers.length} fornecedores`);
  console.log(`   • ${warehouses.length} armazéns`);
  console.log(`   • ${products.length} produtos`);
  console.log(`   • ${products.length * 3} níveis de estoque`);
  console.log(`   • ${movements.length} movimentações`);
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Admin:   admin@example.com / senha123');
  console.log('   Gerente: gerente@example.com / senha123');
  console.log('   Usuário: usuario@example.com / senha123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
