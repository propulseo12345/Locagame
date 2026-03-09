import { ProductsQueries } from './products.queries';
import { ProductsAvailability } from './products.availability';
import { ProductsAdmin } from './products.admin';

export { normalizeProduct, DEFAULT_SPECIFICATIONS, DEFAULT_PRICING } from './products.normalizers';

export class ProductsService {
  // Queries
  static getProducts = ProductsQueries.getProducts;
  static getFeaturedProducts = ProductsQueries.getFeaturedProducts;
  static searchProducts = ProductsQueries.searchProducts;
  static getProductById = ProductsQueries.getProductById;
  static getProductsWithStock = ProductsQueries.getProductsWithStock;
  static getProductCountsByCategory = ProductsQueries.getProductCountsByCategory;

  // Availability
  static checkAvailability = ProductsAvailability.checkAvailability;
  static getAvailableStock = ProductsAvailability.getAvailableStock;
  static getAvailableStockForDates = ProductsAvailability.getAvailableStockForDates;
  static createReservationAvailability = ProductsAvailability.createReservationAvailability;
  static releaseReservationAvailability = ProductsAvailability.releaseReservationAvailability;

  // Admin
  static createProduct = ProductsAdmin.createProduct;
  static updateProduct = ProductsAdmin.updateProduct;
  static deleteProduct = ProductsAdmin.deleteProduct;
  static getProductAvailability = ProductsAdmin.getProductAvailability;
  static createAvailability = ProductsAdmin.createAvailability;
  static deleteAvailability = ProductsAdmin.deleteAvailability;
}
