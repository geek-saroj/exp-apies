//@ts-nocheck
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { Blob } from 'buffer';

@Entity()
export class MediaResource extends BaseEntity {
  @PrimaryColumn({ nullable: false, unique: true })
  key: string;

  @Column('bytea', { select: true, nullable: true })
  value: Blob;

  //mime type
  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, default: false })
  isExternalUrl: boolean;

  @Column({ nullable: true, type: 'boolean', default: false })
  isThumbnail: boolean;

  // constructor(data: Partial<MediaResource>) {
  //   super();
  //   Object.assign(this, data);
  // }
}
