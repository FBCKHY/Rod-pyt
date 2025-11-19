const sequelize = require('../config/database');
const Subscription = require('./subscription');
const Product = require('./product');
const ProductCategory = require('./productCategory');
const ProductTag = require('./productTag');

// 设置模型关联关系

// 产品与分类的关联
Product.belongsTo(ProductCategory, {
  foreignKey: 'category_id',
  as: 'category'
});

ProductCategory.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

// 产品与标签的多对多关联
Product.belongsToMany(ProductTag, {
  through: 'product_tag_relations',
  foreignKey: 'product_id',
  otherKey: 'tag_id',
  as: 'tags'
});

ProductTag.belongsToMany(Product, {
  through: 'product_tag_relations',
  foreignKey: 'tag_id',
  otherKey: 'product_id',
  as: 'products'
});

// 导出所有模型和sequelize实例
module.exports = {
  sequelize,
  Subscription,
  Product,
  ProductCategory,
  ProductTag
}; 