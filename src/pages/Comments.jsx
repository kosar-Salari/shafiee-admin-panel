const Comments = () => {
  const products = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `محصول شماره ${i + 1}`,
    description: 'توضیحات کوتاه محصول در این قسمت نمایش داده می‌شود',
    price: ((i + 1) * 15000).toLocaleString('fa-IR')
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">مدیریتjjjjjjjjjjjjjjjjjjjjjjj محصولات</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">{product.price} تومان</span>
                <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
                  ویرایش
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;