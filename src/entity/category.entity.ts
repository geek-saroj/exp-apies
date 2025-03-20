import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn()
  parent: Category;

  // For loading multiple levels of parents
  @OneToMany(() => Category, (category: Category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  product: Product[];
}
