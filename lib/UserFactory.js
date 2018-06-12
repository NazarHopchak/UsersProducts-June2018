"use strict"

// of course, it's better to put the names into config
const usersTable = 'users';
const productsTable = 'products';
const transactionsTable = 'transactions';
const salariesTable = 'salaries';
const discountsTable = 'discounts';

const predicatesMap = {
	id: 'userId',
	name: 'userName',
	email: 'userEmail',
	balance: formGetBalanceQuery()
	// more possible options to filter by should be added (for instance, count of purchased products, date of last purchase, overall income and so on)
};

const validPredicatesConditions = {
	'=': '=',
	'<>': '<>',
	'>=': '>=',
	'<=': '<=',
	'>': '>',
	'<': '<'
};

module.exports = class UserFactory {
	constructor(databaseConnection) {
		this.databaseConnection = databaseConnection
	}


	getUserById(userId, callback) {
		var predicate = {
			name: 'id',
			cond: '=',
			value: userId
		};
		var query = formFindUsersQuery([ predicate ]);
		this.databaseConnection.query(query, function(err, data) {
			if (err) return callback(err);
			if (!data || !data.length) return callback(new Error('User not found!'));
			callback(null, data[0]);
		});
	}

	getAllUsers(callback) {
		var query = formFindUsersQuery();
		this.databaseConnection.query(query, callback);
	}

	getUsers(predicates, callback) {
		var query = formFindUsersQuery(predicates);
		this.databaseConnection.query(query, callback);
	}

	getUserPurchases(userId, callback) {
		var query = formGetUserPurchasesQuery(userId);
		this.databaseConnection.query(query, callback);
	}

}

function formFindUsersQuery(predicates) {
	var conditions = formConditions(predicates);
	var selectStatement = 'SELECT * FROM ' + usersTable;
	var whereStatement = (conditions && conditions.length) ? ' WHERE ' + conditions.join(',') : '';
	var query = selectStatement + whereStatement;
	return query;
};

function formConditions(predicates) {
	if (!predicates || !predicates.length) return [];
	return predicates.map((predicate) => {
		if (!validPredicatesConditions[predicate.cond]) return '1=1';
		return '(' + predicatesMap[predicate.name] + predicate.cond + predicate.value + ')';
	});
};

function formGetBalanceQuery() {
	var incomeQuery = '(SELECT SUM(amount) FROM ' + salariesTable + ' WHERE ' + salariesTable + '.userId=' + usersTable + '.userId)';
	var productDiscountQuery = 'COALESCE((SELECT percentage FROM ' + discountsTable + ' WHERE ' + discountsTable + '.userId=' + usersTable + '.userId AND ' + discountsTable + '.productId=' + productsTable + '.productId LIMIT 1), 0)';
	var productPriceQuery = '(SELECT (price - price/100*'+ productDiscountQuery +') as price WHERE ' + productsTable + '.productId=' + transactionsTable + '.productId LIMIT 1)';
	var outcomeQuery = '(SELECT SUM(' + productPriceQuery + ') FROM ' + transactionsTable + ' WHERE ' + transactionsTable + '.userId=' + usersTable + '.userId)';
	var balanceQuery = '(SELECT ' + incomeQuery + ' - ' + outcomeQuery + ')';
	return balanceQuery;
};

function formGetUserPurchasesQuery(userId) {
	var columns = [
		productsTable + '.productName',
		transactionsTable + '.timestamp'
	];
	var selectStatement = 'SELECT ' + columns.join(',') + ' FROM ' + transactionsTable;
	var joinStatement = ' JOIN ' + productsTable + ' ON ' + transactionsTable + '.productId=' + productsTable + '.productId';
	var whereStatement = ' WHERE userId=' + userId;
	var orderStatement = ' ORDER BY ' + transactionsTable + '.timestamp DESC'; 
	var query = selectStatement + joinStatement + whereStatement + orderStatement;
	return query;
};