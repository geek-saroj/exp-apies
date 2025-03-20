import { Category } from "../entity/category.entity";
import { Product } from "../entity/product.entity";
import { Controller } from "./index";
import { algoliasearch } from "algoliasearch";
import Redis from "ioredis";
import { insightsClient } from "@algolia/client-insights";

const redis = new Redis();

const prasonalizedClient = algoliasearch(
  process.env.ALGOLIA_APP_ID || "",
  process.env.ALGOLIA_API_KEY || ""
).initPersonalization({ region: "eu" });

const client = algoliasearch(process.env.ALGOLIA_APP_ID || "", process.env.ALGOLIA_API_KEY || "");
// const client = algoliasearch("ICKM3MPERI", "5d5fed21be4b5eecab56e835ccb3ebbd");

// const client = algoliasearch("ICKM3MPERI", "5d5fed21be4b5eecab56e835ccb3ebbd");
const insights = algoliasearch(process.env.ALGOLIA_APP_ID || "", process.env.ALGOLIA_API_KEY || "").initInsights({
  region: "de",
});

const client1 = algoliasearch(process.env.ALGOLIA_APP_ID || "", process.env.ALGOLIA_API_KEY || "").initPersonalization({
  region: "us",
});
export class ProductController extends Controller {
  async createProduct(req: any, res: any) {
    try {
      const foundCategory = await this.dataSource.manager.findOneOrFail(Category, {
        where: { id: req.body.category },
        relations: {
          parent: {
            parent: { parent: { parent: { parent: { parent: true } } } },
          },
        },
      });

      const product = new Product();
      product.name = req.body.name;
      product.category = foundCategory;
      product.specifications = req.body.specifications;
      await this.dataSource.manager.save(product);
      return res.status(200).json({ message: "Product created successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error creating product", error: error });
    }
  }
  async getProduct(req: any, res: any) {
    try {
      const data = await this.dataSource.manager.find(Product, {
        relations: {
          category: {
            parent: {
              parent: {
                parent: {
                  parent: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ message: "Error creating product", error: err });
    }
  }

  async createProductIndex1(req: any, res: any) {
    try {
      const { event, userId, timestamp } = req.body;
      const data = await this.dataSource.getRepository(Product).createQueryBuilder("product").getMany();
      const product: any = data;
      const response = await client.saveObjects({ indexName: "product_index1", objects: product });

      const eventData = {
        userId,
        event,
        properties: {
          timestamp,
        },
      };
      console.log("Publishing event:", eventData);
      await redis.publish("SEGMENT_TRACKING", JSON.stringify(eventData));

      res.status(200).json({
        message: "Product index created",
        data: response,
      });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        message: "An error occurred while fetching products",
        error: error.message,
      });
    }
  }

  // async createProductIndex(req: any, res: any) {
  //   try {
  //     const products = await this.dataSource
  //       .getRepository(Product)
  //       .createQueryBuilder("product")
  //       .leftJoinAndSelect("product.category", "category")
  //       .getMany();

  //     const indexableProducts = products.map((product) => ({
  //       objectID: product.id,
  //       id: product.id,
  //       name: product.name,
  //       price: product.price,
  //       image: product.image,
  //       specifications: product.specifications,
  //       // Include only necessary category data
  //       categoryId: product.category?.id,
  //       categoryName: product.category?.name,
  //     }));
  //     const response = await client.saveObjects({ indexName: "new_product", objects: indexableProducts });

  //     res.status(200).json({
  //       message: "Product index created",
  //       data: response,
  //     });
  //   } catch (error: any) {
  //     console.error("Error fetching products:", error);
  //     res.status(500).json({
  //       message: "An error occurred while fetching products",
  //       error: error.message,
  //     });
  //   }
  // }

  async createProductIndex(req: any, res: any) {
    try {
      const products = await this.dataSource
        .getRepository(Product)
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
        .getMany();

      const indexableProducts = products.map((product) => ({
        objectID: product.id,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        specifications: product.specifications,
        categoryId: product.category?.id,
        categoryName: product.category?.name,
      }));

      let productsToSave = [];

      for (const product of indexableProducts) {
        try {
          await client.getObject({
            indexName: "new_product",
            objectID: product?.objectID?.toString(),
          });

          console.log(`Product with ID ${product.objectID} already exists in Algolia. Skipping.`);
        } catch (error: any) {
          if (error?.status === 404) {
            productsToSave.push(product);
          } else {
            console.error(`Error checking product ${product.objectID}:`, error);
          }
        }
      }

      console.log("Products to save:", productsToSave);

      if (productsToSave.length > 0) {
        const response = await client.saveObjects({
          indexName: "new_product",
          objects: productsToSave,
        });

        res.status(200).json({
          message: "Product index created",
          data: response,
        });
      } else {
        res.status(200).json({
          message: "No new products to index, all products already exist in Algolia.",
        });
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        message: "An error occurred while fetching products",
        error: error.message,
      });
    }
  }

  async getProductById(req: any, res: any) {
    try {
      const data = await this.dataSource.manager.findOneByOrFail(Product, {
        id: req.params.id,
      });
      const response = await insights.pushEvents({
        events: [
          {
            eventType: "click",
            eventName: "Product Clicked",
            index: "new_product",
            userToken: "user-123456",
            authenticatedUserToken: "user-123456",
            objectIDs: [req.params.id],
            queryID: "43b15df305339e827f0ac0bdc5ebcaa7",
            positions: [7],
          },
        ],
      });

      res.status(200).json({
        response,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async formatProductData(products: Product[]) {
    return products.map((product: any) => ({
      objectID: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      likes: product.likes || 0,
      dislikes: product.dislikes || 0,
      createdAt: product.createdAt,
    }));
  }
  async trackUserAction(productId: any, action: "like" | "dislike") {
    const product: any = await client.getObject(productId);
    const updatedProduct: any = {
      ...product,
      [action]: product[action] + 1,
    };

    await client.partialUpdateObject(updatedProduct);
  }

  async updateindex(req: any, res: any) {
    const { productId, attribute, value } = req.body;

    const product: any = await await client.getObject({
      indexName: "product-index",
      objectID: productId.toString(),
    });

    const updatedProduct: any = {
      ...product,
      [attribute]: value,
    };
    const updateResponse = await client.partialUpdateObjects({
      indexName: "hurryapp-product",
      objects: [updatedProduct],
      createIfNotExists: false,
      waitForTasks: true,
    });
    res.status(200).json({
      message: "Product index created",
      data: updateResponse,
    });
  }

  async deleteIndex(req: any, res: any) {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Product IDs are required and should be an array." });
    }

    try {
      const deleteResponse = await client.deleteObjects({
        indexName: "hurryapp-product",
        objectIDs: productIds,
      });

      // Send a successful response
      res.status(200).json({
        message: "Product index objects deleted successfully",
        objectIDs: deleteResponse,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Error deleting product index objects",
        error: error.message,
      });
    }
  }

  async updateProductInAlgolia(product: any) {
    await client.saveObject({
      ...product,
      objectID: product.id,
    });
  }

  async getValuetoexistingObj(req: any, res: any) {
    try {
      const results = await client.searchSingleIndex({
        indexName: "new_product",
        searchParams: { query: "" },
      });

      const products = results.hits || [];
      if (products.length === 0) {
        console.log("No products found in the index.");
        return;
      }

      res.status(200).json({
        results,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "An error occurred while updating products",
        error: error.message,
      });
    }
  }
  async addValuetoexistingObj(req: any, res: any) {
    try {
      const results = await client.searchSingleIndex({
        indexName: "new_product",
        searchParams: { query: "" },
      });

      const products = results.hits || [];

      if (products.length === 0) {
        console.log("No products found in the index.");
        return res.status(404).json({
          message: "No products found in the index",
        });
      }

      // const updatedProducts = products.map((product: any) => {
      //   return {
      //     objectID: product.objectID,
      //     like: product.like || 0,
      //     dislike: product.dislike || 0,
      //   };
      // });

      const updatedProducts = products.map((product: any) => {
        return {
          objectID: product.objectID,
          description: "test",
        };
      });

      const updateResponse = await client.partialUpdateObjects({
        indexName: "new_product",
        objects: updatedProducts,
        createIfNotExists: true,
        waitForTasks: true,
      });

      res.status(200).json({
        message: "Products updated successfully",
        updateResponse,
      });
    } catch (error: any) {
      console.error("Error adding likes/dislikes to existing products:", error);
      res.status(500).json({
        message: "An error occurred while updating products",
        error: error.message,
      });
    }
  }
  async updateLikeDislikeForProduct(req: any, res: any) {
    try {
      const { productId, action } = req.body;

      if (!productId || !action || (action !== "like" && action !== "dislike")) {
        return res.status(400).json({
          message: "Invalid input. Please provide a valid productId and action (like or dislike).",
        });
      }

      const product: any = await client.getObject({
        indexName: "new_product",
        objectID: productId,
      });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${productId} not found.`,
        });
      }

      const likeCount = product.like || 0;
      const dislikeCount = product.dislike || 0;

      let updatedProduct: { objectID: string; like?: number; dislike?: number } = {
        objectID: productId,
      };

      // if (action === "like") {
      //   updatedProduct.like = likeCount + 1;
      // } else if (action === "dislike") {
      //   updatedProduct.dislike = dislikeCount + 1;
      // }

      action === "like"
        ? (updatedProduct.like = likeCount + 1)
        : action === "dislike"
        ? (updatedProduct.dislike = dislikeCount + 1)
        : null;

      const updateResponse = await client.partialUpdateObjects({
        indexName: "new_product",
        objects: [updatedProduct],
        createIfNotExists: false,
        waitForTasks: true,
      });

      res.status(200).json({
        message: `Product ${action} count updated successfully.`,
        updateResponse,
      });
    } catch (error: any) {
      console.error("Error updating like/dislike for product:", error);
      res.status(500).json({
        message: "An error occurred while updating the product.",
        error: error.message,
      });
    }
  }

  async updateDescriptionForProduct(req: any, res: any) {
    try {
      const { productId, description } = req.body;

      if (!productId || !description) {
        return res.status(400).json({
          message: "Invalid input. Please provide a valid productId and description",
        });
      }

      const product: any = await client.getObject({
        indexName: "new_product",
        objectID: productId,
      });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${productId} not found.`,
        });
      }

      let updatedProduct: { objectID: string; description: string } = {
        objectID: productId,
        description,
      };

      const updateResponse = await client.partialUpdateObjects({
        indexName: "new_product",
        objects: [updatedProduct],
        createIfNotExists: false,
        waitForTasks: true,
      });

      res.status(200).json({
        message: `Product description updated successfully.`,
        updateResponse,
      });
    } catch (error: any) {
      console.error("Error updating like/dislike for product:", error);
      res.status(500).json({
        message: "An error occurred while updating the product.",
        error: error.message,
      });
    }
  }

  async getPersonalizedSearchResult(req: any, res: any) {
    try {
      const response = await client.search({
        requests: [{ indexName: "new_product", query: "", hitsPerPage: 50 }],
      });
      // const response = await prasonalizedClient.getPersonalizationStrategy();
      // const response = await prasonalizedClient.setPersonalizationStrategy({
      //   eventsScoring: [{ score: 42, eventName: "Algolia", eventType: "click" }],
      //   facetsScoring: [{ score: 42, facetName: "Event" }],
      //   personalizationImpact: 42,
      // });

      // const response = await client1.getUserTokenProfile({ userToken: "user-123456" });

      res.status(200).json({
        message: "Personalized search results",
        data: response,
      });
    } catch (error: any) {
      console.error("Error fetching personalized search results:", error);
      res.status(500).json({
        message: "An error occurred while fetching personalized search results",
        error: error.message,
      });
    }
  }

  async getPersonalizedSearch(req: any, res: any) {
    try {
      const { query = "" } = req.body;
      const page = req.body.page || 0;
      const hitsPerPage = req.body.hitsPerPage || 20;

      // Using the static userToken from your example
      const userToken = "user-2";

      // Get user profile to understand preferences
      // const userProfile = await client.initPersonalization({ region: "us" }).getUserTokenProfile({ userToken });

      // Perform search with personalization using v5 syntax
      const searchResults = await client.searchSingleIndex({
        indexName: "movies_index",
        searchParams: {
          query,
          page,
          hitsPerPage,
          enablePersonalization: true,
          userToken,
        },
      });

      // Track this search for future personalization
      // await client.initInsights({ region: "de" }).pushEvents({
      //   events: [
      //     {
      //       eventType: "view",
      //       eventName: "Search Performed",
      //       index: "new_product",
      //       userToken,
      //       authenticatedUserToken: userToken,
      //       queryID: searchResults.queryID || "",
      //     }
      //   ]
      // });

      res.status(200).json({
        message: "Personalized search results",
        data: searchResults,
        success: true,
      });
    } catch (error: any) {
      console.error("Error fetching personalized search results:", error);
      res.status(500).json({
        message: "An error occurred while fetching personalized search results",
        error: error.message,
        success: false,
      });
    }
  }

  /**
   * Records interaction events for better personalization
   * Uses the static userToken from your example
   */
  async recordEvent(req: any, res: any) {
    try {
      const { eventType, eventName, objectIDs, queryID, positions } = req.body;
      const userToken = "user-123456";

      if (!eventType || !eventName || !objectIDs) {
        return res.status(400).json({
          message: "Missing required parameters",
          success: false,
        });
      }

      const insightsClient = client.initInsights({ region: "de" });
      const response = await insightsClient.pushEvents({
        events: [
          {
            eventType,
            eventName,
            index: "new_product",
            userToken,
            authenticatedUserToken: userToken,
            objectIDs,
            queryID: queryID || "",
            positions: positions || [],
          },
        ],
      });

      res.status(200).json({
        message: "Event recorded successfully",
        data: response,
        success: true,
      });
    } catch (error: any) {
      console.error("Error recording event:", error);
      res.status(500).json({
        message: "An error occurred while recording event",
        error: error.message,
        success: false,
      });
    }
  }

  async getUserProfile(req: any, res: any) {
    try {
      const userToken = "user-123456";

      const personalizationClient = client.initPersonalization({ region: "eu" });
      const userProfile = await personalizationClient.getUserTokenProfile({ userToken });

      res.status(200).json({
        message: "User profile retrieved successfully",
        data: userProfile,
        success: true,
      });
    } catch (error: any) {
      console.error("Error retrieving user profile:", error);
      res.status(500).json({
        message: "An error occurred while retrieving user profile",
        error: error.message,
        success: false,
      });
    }
  }
}
