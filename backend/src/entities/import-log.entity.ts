import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('import_logs')
export class ImportLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  marketCode!: string;

  @Column({ type: 'varchar' })
  filename!: string;

  @Column({ type: 'int' })
  rowsProcessed!: number;

  @Column({ type: 'int' })
  rowsInserted!: number;

  @Column({ type: 'int' })
  rowsUpdated!: number;

  @Column({ type: 'jsonb', default: [] })
  errors!: Array<Record<string, unknown>>;

  @Column({ type: 'timestamp' })
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date | null;
}
