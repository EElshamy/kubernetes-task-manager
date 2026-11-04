import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1762250000000
  implements MigrationInterface
{
  name = 'CreateTasksTable1762250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL NOT NULL,
        "title" VARCHAR(100) NOT NULL,
        "description" VARCHAR(500) NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'todo',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
