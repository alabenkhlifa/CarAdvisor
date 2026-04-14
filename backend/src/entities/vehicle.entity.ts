import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Model } from './model.entity';
import { Market } from './market.entity';

export enum VehicleCondition {
  NEW = 'new',
  USED = 'used',
}

@Entity('vehicles')
@Unique(['marketId', 'sourceId'])
@Index(['marketId', 'condition', 'price'])
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelId!: number;

  @ManyToOne(() => Model, { eager: true })
  @JoinColumn({ name: 'modelId' })
  model!: Model;

  @Column()
  marketId!: number;

  @ManyToOne(() => Market, { eager: true })
  @JoinColumn({ name: 'marketId' })
  market!: Market;

  @Column({ type: 'varchar', nullable: true })
  trimName!: string | null;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'enum', enum: VehicleCondition })
  condition!: VehicleCondition;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', nullable: true })
  mileageKm!: number | null;

  @Column({ type: 'varchar' })
  fuelType!: string;

  @Column({ type: 'varchar' })
  transmission!: string;

  @Column({ type: 'varchar', nullable: true })
  engineSize!: string | null;

  @Column({ type: 'int', nullable: true })
  horsepower!: number | null;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  features!: Record<string, boolean> | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl!: string | null;

  @Column({ type: 'varchar' })
  sourceId!: string;

  @Column({ type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  listedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
