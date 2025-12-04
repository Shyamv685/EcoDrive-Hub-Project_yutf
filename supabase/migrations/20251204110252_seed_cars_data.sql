BEGIN;

-- Insert sample cars
INSERT INTO cars (name, type, emission_rate, location, available, image_url) VALUES
('Tesla Model 3', 'EV', 0, 'San Francisco', true, 'https://images.unsplash.com/photo-1617654112368-307921291f42?w=800'),
('Toyota Prius', 'Hybrid', 95, 'San Francisco', true, 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800'),
('Nissan Leaf', 'EV', 0, 'Los Angeles', true, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
('Honda Civic', 'Gas', 150, 'Los Angeles', true, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'),
('BMW i4', 'EV', 0, 'New York', true, 'https://images.unsplash.com/photo-1617654112368-307921291f42?w=800'),
('Ford Fusion Hybrid', 'Hybrid', 87, 'New York', true, 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800'),
('Chevrolet Bolt', 'EV', 0, 'Chicago', true, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
('Toyota Camry', 'Gas', 165, 'Chicago', true, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'),
('Hyundai Kona Electric', 'EV', 0, 'Seattle', true, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
('Kia Niro', 'Hybrid', 88, 'Seattle', true, 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800');

COMMIT;