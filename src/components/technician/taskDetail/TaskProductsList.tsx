import { DeliveryTask } from '../../../types';

interface TaskProductsListProps {
  products: DeliveryTask['products'];
}

export function TaskProductsList({ products }: TaskProductsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Produits</h2>
      <div className="space-y-3">
        {products.map((product, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{product.productName}</p>
              <p className="text-sm text-gray-600">{"Quantit\u00e9: "}{product.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
