import { algoliasearch } from "algoliasearch";
import { Controller } from ".";
import { Product } from "../entity/product.entity";

const client = algoliasearch(process.env.ALGOLIA_APP_ID || "", process.env.ALGOLIA_API_KEY || "");

// Fetch and index objects in Algolia
const processRecords = async () => {
  const datasetRequest = await fetch("https://dashboard.algolia.com/api/1/sample_datasets?type=movie");
  const movies: any = await datasetRequest.json();
  return await client.saveObjects({ indexName: "movies_index", objects: movies });
};

export default processRecords;
