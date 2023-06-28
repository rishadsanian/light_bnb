SELECT r.id as id, p.title as title, r.start_date as start_date, p.cost_per_night, AVG(pr.rating)
FROM reservations r 
JOIN properties p ON r.property_id=p.id
JOIN property_reviews pr ON pr.property_id = p.id
WHERE r.guest_id = 1
GROUP BY r.id, p.title, r.start_date, p.cost_per_night
ORDER BY r.start_date
LIMIT 10;