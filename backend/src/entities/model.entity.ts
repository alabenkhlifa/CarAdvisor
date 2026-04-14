import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Brand } from './brand.entity';

export enum BodyType {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  MINIVAN = 'minivan',
  COUPE = 'coupe',
  CONVERTIBLE = 'convertible',
  WAGON = 'wagon',
  PICKUP = 'pickup',
}

@Entity('models')
@Unique(['brandId', 'name'])
export class Model {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  brandId!: number;

  @ManyToOne(() => Brand, (brand) => brand.models)
  @JoinColumn({ name: 'brandId' })
  brand!: Brand;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'enum', enum: BodyType })
  bodyType!: BodyType;

  @Column({ type: 'simple-array' })
  fuelTypes!: string[];

  @Column({ type: 'int', nullable: true })
  yearStart!: number | null;

  @Column({ type: 'int', nullable: true })
  yearEnd!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
