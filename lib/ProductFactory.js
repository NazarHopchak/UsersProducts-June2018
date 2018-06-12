"use strict"

// of course, it's better to put the names into config
const usersTable = 'users';
const productsTable = 'products';
const transactionsTable = 'transactions';
const salariesTable = 'salaries';
const discountsTable = 'discounts';

module.exports = class ProductFactory {
	constructor(databaseConnection) {
		this.databaseConnection = databaseConnection
	}

	getAllProducts(callback) {

	}

	getProducts(predicates, callback) {

	}

}