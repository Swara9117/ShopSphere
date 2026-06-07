export const getProductImage = (product) => {
  if (product?.images?.length) return product.images[0];
  return product?.image || '/images/sample.jpg';
};

export const getShopkeeperName = (product) =>
  product?.shopkeeper?.name || product?.shopkeeperName || 'Unknown seller';
