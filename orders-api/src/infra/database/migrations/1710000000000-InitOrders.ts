import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitOrders1710000000000 implements MigrationInterface {
  name = 'InitOrders1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELED')`);
    await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "productId" character varying NOT NULL, "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "orderId" uuid, CONSTRAINT "PK_d01158fe15b1ead5fcfd4b15b4f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_2a8262a0d1c10c6156c4b3027e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_2a8262a0d1c10c6156c4b3027e1"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
  }
}


