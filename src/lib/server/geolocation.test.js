import test from 'node:test';
import assert from 'node:assert/strict';
import { filterRestaurantsWithinRadius } from './geolocation.js';

test('filters restaurants within 500m of a search location', () => {
	const center = { lat: 51.519, lon: -0.078 };
	const restaurants = [
		{ name: 'Near', latitude: 51.5191, longitude: -0.0781 },
		{ name: 'Close', latitude: 51.522, longitude: -0.074 },
		{ name: 'Far', latitude: 51.53, longitude: -0.09 }
	];

	const filtered = filterRestaurantsWithinRadius(restaurants, center, 500);
	assert.deepEqual(
		filtered.map((restaurant) => restaurant.name),
		['Near', 'Close']
	);
});
