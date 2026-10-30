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

test('sorts restaurants in the radius from nearest to farthest', () => {
	const center = { lat: 51.504, lon: -0.1 };
	const restaurants = [
		{ name: 'Far', latitude: 51.513, longitude: -0.12 },
		{ name: 'Near', latitude: 51.5043, longitude: -0.1002 },
		{ name: 'Middle', latitude: 51.508, longitude: -0.11 }
	];

	const filtered = filterRestaurantsWithinRadius(restaurants, center, 2000);
	assert.deepEqual(
		filtered.map((restaurant) => restaurant.name),
		['Near', 'Middle', 'Far']
	);
});
