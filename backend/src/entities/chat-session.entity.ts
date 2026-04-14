import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Market } from './market.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  sessionToken!: string;

  @Column()
  marketId!: number;

  @ManyToOne(() => Market)
  @JoinColumn({ name: 'marketId' })
  market!: Market;

  @Column({ type: 'jsonb', default: {} })
  preferences!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  messages!: Array<{ role: string; content: string; timestamp: string }>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;
}
