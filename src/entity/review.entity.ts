import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: "decimal", precision: 1 })
  rating: number;

  @Column({ nullable: false })
  comment: string;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews, {
    nullable: false,
  })
  product: Product;

  constructor(data: Partial<Review>) {
    super();
    Object.assign(this, data);
  }
}
