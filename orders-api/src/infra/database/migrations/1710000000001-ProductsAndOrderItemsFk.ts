import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductsAndOrderItemsFk1710000000001 implements MigrationInterface {
  name = 'ProductsAndOrderItemsFk1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "price" numeric(12,2) NOT NULL, "stock_qty" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "productId"`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN "productId" uuid`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_product" ON "order_items" ("productId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_product"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "productId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}


