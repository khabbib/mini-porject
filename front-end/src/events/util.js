import { navigateTo } from './navigator';

async function checkAuthInLoginPage() {
	// Check if user is authenticated
	const token = localStorage.getItem('sessionToken'); // Retrieve the token from cookie or local storage
	if (token) {
		console.log('token: ', token);
		await fetch('http://localhost:8080/auth/check', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token })
		}).then((res) => {
			console.log('check Response in login page: ', res);
			if (res.status === 200) {
				console.log('User is still logged in');
				navigateTo('dashboard', null);
			} else {
				localStorage.removeItem('sessionToken');
			}
		});
	}
}

async function checkAuthInDashboardPage() {
	console.log('Checking auth in dashboard page');
	// Check if user is authenticated
	const token = localStorage.getItem('sessionToken'); // Retrieve the token from cookie or local storage
	if (token) {
		// Authenticate the user
		await fetch('http://localhost:8080/auth/check', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token })
		})
			.then((res) => {
				console.log('check Response: ', res);
				if (res.status === 200) {
					console.log('User is still logged in');
				} else {
					localStorage.removeItem('sessionToken');
					navigateTo('login', "You're not logged in");
				}
			})
			.catch((err) => {
				console.error('Dashboard Authentication failed: ', err);
			});
	} else {
		navigateTo('login', "You're not logged in");
	}
}

async function getOnlineUsers() {
	try {
		const response = await fetch('http://localhost:8080/auth/online', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const users = await response.json();
			return users;
		} else {
			throw new Error('Failed to get online users');
		}
	} catch (error) {
		console.error('Error retrieving online users:', error);
		return [];
	}
}

async function createUser(name, email, password) {
	if (name === '' || email === '' || password === '') {
		return makeErrorMessage('Name, email or password cannot be empty');
	}

	if (!email.includes('@')) {
		return makeErrorMessage('Email is not valid');
	}

	if (password.length < 5) {
		return makeErrorMessage('Password must be at least 5 characters long');
	}

	try {
		await fetch('http://localhost:8080/users/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name, email, password })
		}).then((res) => {
			if (res.status === 200) {
				navigateTo('login', 'User created successfully');
				// Add a function to give information to user
			}
		});
	} catch (error) {
		console.log('Error creating user:', error);
	}
}

async function handleLogout() {
	//localStorage.removeItem('sessionToken'); // Clear the token from cookie or local storage
	// navigateTo('login', 'You have been logged out');
	const token = localStorage.getItem('sessionToken'); // Retrieve the token from cookie or local storage
	if (token) {
		console.log('token: ', token);
		await fetch('http://localhost:8080/auth/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token })
		}).then((res) => {
			console.log('Logout response: ', res);
			if (res.status === 200) {
				console.log('User is still logged in');
				navigateTo('login', 'You have been logged out');
				localStorage.removeItem('sessionToken');
				localStorage.removeItem('userEmail');
			}
		});
	}
}

async function validateLogin(email, password) {
	console.log('Validating login');
	if (email === '' || password === '') {
		return makeErrorMessage('Email or password cannot be empty');
	}

	if (!email.includes('@')) {
		return makeErrorMessage('Email is not valid');
	}

	try {
		const response = await fetch('http://localhost:8080/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include' // Enable sending cookies with cross-origin requests
		}).then((res) => res.json());
		console.log('Response: ', response);
		if (response.length > 0 && response[0].cookie) {
			window.localStorage.setItem('sessionToken', response[0].cookie);
			window.localStorage.setItem('userEmail', email); // Store the email in local storage
			navigateTo('dashboard', 'Successfully logged in');
		} else {
			return makeErrorMessage('Email or password is incorrect');
		}
	} catch (er) {
		return makeErrorMessage('Something went wrong, please try again later');
	}
}

function makeErrorMessage(error) {
	return {
		status: 'error',
		error
	};
}

async function getAllProducts() {
	try {
		const response = await fetch('http://localhost:8080/products/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const products = await response.json();
			return products;
		} else {
			console.log('Error');
		}
	} catch (error) {
		console.error('Error retrieving products:', error);
		return [];
	}
}

async function getSearchedProduct(query) {
	if (query === '') return [];
	try {
		const response = await fetch('http://localhost:8080/search/' + query, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const search = await response.json();
			return search;
		} else {
			console.log('Error');
			return [];
		}
	} catch (error) {
		console.error('Error retrieving search:', error);
		return [];
	}
}

async function getUserId(email) {
	console.log(email + ' THIS IS EMAIL');
	console.log('THIS IS QUERY: ' + 'http://localhost:8080/users/useremail?email=' + email);
	const response = await fetch(`http://localhost:8080/users/useremail?email=` + email);
	const userId = await response.text();
	console.log('USERID: ' + userId);
	return userId;
}

async function getOrderHistory(email) {
	const userId = await getUserId(localStorage.getItem('userEmail'));
	const response = await fetch(`http://localhost:8080/order/customer?id=` + userId);
	const orderHistory = await response.json();
	console.log(orderHistory);
	return orderHistory;
}

async function getCart() {
	const userId = await getUserId(localStorage.getItem('userEmail'));

	console.log('USERID: ' + userId);
	// const response = await fetch(`http://localhost:8080/cart/cartById?id=` + userId);
	// const cart = await response.json();
	// console.log(cart);
	// return cart;

	try {
		const response = await fetch('http://localhost:8080/cart/?id=' + userId, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(async (res) => {
			const search = await res.json();
			console.log('Cart', search);
			return search;
		});
	} catch (error) {
		console.error('Error retrieving search:', error);
		return [];
	}
}
export {
	getOrderHistory,
	checkAuthInLoginPage,
	checkAuthInDashboardPage,
	handleLogout,
	validateLogin,
	getOnlineUsers,
	getAllProducts,
	getSearchedProduct,
	createUser,
	getUserId,
	getCart
};
