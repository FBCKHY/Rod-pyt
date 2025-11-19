const sequelize = require('../config/database');
const Subscription = require('./subscription');
const Product = require('./product');
const ProductCategory = require('./productCategory');
const ProductTag = require('./productTag');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');

// 设置模型关联关系

// 用户与角色的多对多关联
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// 角色与权限的多对多关联
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

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
  ProductTag,
  User,
  Role,
  Permission
};