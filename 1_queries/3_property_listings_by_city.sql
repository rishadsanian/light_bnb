SELECT p.id, p.title, p.cost_per_night, AVG(r.rating) as average_rating
FROM properties p LEFT JOIN property_reviews r
ON r.property_id = p.id
WHERE p.city LIKE '%ancouve%'
GROUP BY p.id
HAVING AVG(r.rating)>=4
ORDER BY p.cost_per_night
LIMIT 10;
