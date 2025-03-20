import { date } from "joi";
import { Category } from "../entity/category.entity";
import { Controller } from "./index";

export class CategoryController extends Controller {
  async createCategory(req: any, res: any) {
    const { name, parent_id } = req.body;

    try {
      if (parent_id) {
        const category = new Category();
        category.name = name;
        category.parent = parent_id;
        await this.dataSource.manager.save(category);
      } else {
        const category = new Category();
        category.name = name;
        await this.dataSource.manager.save(category);
      }
      return res.status(200).json({ message: "Category created successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error creating category", error: error });
    }
  }

  getCategory(req: any, res: any) {
    console.log("this datasource ", this.dataSource);
    const data = this.dataSource.manager.findOneOrFail(Category, req.params.id);
    res.status(200).json(data);
  }

  async getProduct(req: any, res: any): Promise<any> {
    if (!this.dataSource) {
      return res.status(500).json({ message: "DataSource is not initialized" });
    }
    const { id } = req.params;
    console.log("this datasource ", await this.dataSource);
    console.log("id", id);
    try {
      const data = await this.dataSource.manager.find(Category, {
        where: { id: req.params.id },
      });
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
    }
  }
  updateCategory(req: any, res: any) {
    throw new Error("Method not implemented.");
  }
  deleteCategory(req: any, res: any) {
    throw new Error("Method not implemented.");
  }
}
