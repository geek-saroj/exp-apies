import { DataSource } from "typeorm";
import { Category } from "../entity/category.entity";
import { Product } from "../entity/product.entity";
import { MediaResource } from "../entity/media-resource.entity";
import { Review } from "../entity/review.entity";
import { User } from "../entity/user.entity";
import { Config } from "../config/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.dbHost,
  port: Config.dbPort,
  username: Config.dbUsername,
  password: Config.dbPassword,
  database: Config.dbName,
  entities: [Category, Product, MediaResource, Review, User],
  synchronize: true,
  logging: true,
  migrations: [],
  subscribers: [],
  ssl: { rejectUnauthorized: false },
  // ssl: false,
});
