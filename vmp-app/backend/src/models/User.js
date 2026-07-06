const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  mobile: { type: DataTypes.STRING(15), allowNull: false, unique: true },
  role: { type: DataTypes.ENUM('owner', 'staff'), defaultValue: 'staff', allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      user.password_hash = await bcrypt.hash(user.password_hash, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
  },
});

User.prototype.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

User.prototype.toSafeJSON = function () {
  const { password_hash, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
