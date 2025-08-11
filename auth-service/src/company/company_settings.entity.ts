import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryColumn({ type: 'int' })
  id: number; // единственная запись: 1

  @Column({ type: 'varchar', length: 255, default: '' })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
