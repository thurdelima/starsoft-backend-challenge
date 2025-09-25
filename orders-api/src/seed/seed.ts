import { AppDataSource } from '../infra/database/data-source';
import { Product } from '../infra/database/entities/product.entity';

export async function runSeed(): Promise<void> {
  await AppDataSource.initialize();
  const productRepo = AppDataSource.getRepository(Product);
  const count = await productRepo.count();
  if (count === 0) {
    await productRepo
      .createQueryBuilder()
      .insert()
      .values([
        { name: 'Mouse Gamer RGB', price: '129.90', stockQty: 50 },
        { name: 'Teclado Mecânico', price: '349.90', stockQty: 35 },
        { name: 'Monitor 27" IPS', price: '1399.00', stockQty: 15 },
        { name: 'Headset Bluetooth', price: '219.90', stockQty: 40 },
        { name: 'Webcam Full HD', price: '189.90', stockQty: 25 },
        { name: 'Cadeira Ergonômica', price: '999.00', stockQty: 8 },
        { name: 'Notebook i5 16GB', price: '3999.00', stockQty: 5 },
        { name: 'Hub USB-C 7 em 1', price: '159.90', stockQty: 60 },
      ])
      .orIgnore()
      .execute();
  }
  await AppDataSource.destroy();
}

// Allow running directly: ts-node src/seed/seed.ts
if (require.main === module) {
  runSeed()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Seed failed', err);
      process.exit(1);
    });
}


