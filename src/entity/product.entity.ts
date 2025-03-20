import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { MediaResource } from "./media-resource.entity";
import { Review } from "./review.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column("jsonb", { nullable: true })
  specifications: { name: string; description: string }[];

  @ManyToOne(() => Category, (category) => category.product)
  category: Category;

  @OneToMany(() => Review, (review) => review.product, { cascade: true })
  reviews: Review[];
}
