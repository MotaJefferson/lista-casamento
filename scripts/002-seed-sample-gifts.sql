-- Insert sample gifts for testing
INSERT INTO gifts (name, description, price, status, image_url) VALUES
  ('Jogo de Cama', 'Jogo de cama 300 fios - branco', 350.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Batedeira Elétrica', 'Batedeira KitchenAid - vermelho', 450.00, 'purchased', '/placeholder.svg?height=300&width=300'),
  ('Jogo de Louça', 'Jogo de louça 42 peças - azul', 280.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Travesseiros', 'Jogo com 2 travesseiros de plumas', 180.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Toalhas de Banho', 'Jogo com 4 toalhas de banho - cinza', 220.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Cortinas', 'Par de cortinas - branco', 320.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Panelas', 'Jogo de panelas 5 peças - inox', 390.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Geladeira', 'Geladeira brastemp 380l - branca', 2500.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('TV 55 polegadas', 'TV LG 55 polegadas OLED', 3200.00, 'available', '/placeholder.svg?height=300&width=300'),
  ('Sofá', 'Sofá retrátil 3 lugares - cinza', 1800.00, 'available', '/placeholder.svg?height=300&width=300')
ON CONFLICT DO NOTHING;
