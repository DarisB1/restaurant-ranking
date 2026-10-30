import Database from 'better-sqlite3';

const database = new Database('./tastemap.sqlite');

export function getAll() {
	const sql = `SELECT 
    r.*,
    (
        SELECT GROUP_CONCAT(t.name, ', ')
        FROM restaurant_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE rt.restaurant_id = r.id
        ORDER BY rt.position
    ) AS all_tags,
    
    (
        SELECT GROUP_CONCAT(p.url, ', ')
        FROM photos p
        WHERE p.restaurant_id = r.id
        ORDER BY p.position
    ) AS all_photo_urls,
    
    (
        SELECT GROUP_CONCAT(s.comment, ' | ')
        FROM stars s
        WHERE s.restaurant_id = r.id AND s.comment IS NOT NULL
    ) AS all_comments
FROM restaurants r;
`;

	const stmt = database.prepare(sql);

	return stmt.all();
}
