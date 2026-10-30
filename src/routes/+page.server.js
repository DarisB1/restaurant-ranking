import { redirect } from '@sveltejs/kit';
import { getAll } from '#lib/server/database.js';

export const load = async ({ request }) => {
	const all = await getAll();


	return {
		all
	};
};