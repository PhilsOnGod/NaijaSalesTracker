-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  total_purchases INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  payment_method TEXT,
  notes TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL DEFAULT 'Nigerian Sales Tracker',
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 7.5,
  currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create Row Level Security (RLS) policies
-- Products RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products" 
  ON products FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
  ON products FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
  ON products FOR DELETE 
  USING (auth.uid() = user_id);

-- Customers RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customers" 
  ON customers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" 
  ON customers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" 
  ON customers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" 
  ON customers FOR DELETE 
  USING (auth.uid() = user_id);

-- Sales RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales" 
  ON sales FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" 
  ON sales FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" 
  ON sales FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" 
  ON sales FOR DELETE 
  USING (auth.uid() = user_id);

-- Sale Items RLS
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sale items through sales" 
  ON sale_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sale items through sales" 
  ON sale_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sale items through sales" 
  ON sale_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sale items through sales" 
  ON sale_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

-- Business Settings RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own business settings" 
  ON business_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business settings" 
  ON business_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings" 
  ON business_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create function to update customer total_purchases
CREATE OR REPLACE FUNCTION update_customer_total_purchases()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment total_purchases when a new sale is added
    IF NEW.customer_id IS NOT NULL THEN
      UPDATE customers
      SET total_purchases = total_purchases + 1
      WHERE id = NEW.customer_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement total_purchases when a sale is deleted
    IF OLD.customer_id IS NOT NULL THEN
      UPDATE customers
      SET total_purchases = GREATEST(0, total_purchases - 1)
      WHERE id = OLD.customer_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer total_purchases
CREATE TRIGGER update_customer_purchases_on_sale
  AFTER INSERT OR DELETE ON sales
  FOR EACH ROW
  EXECUTE PROCEDURE update_customer_total_purchases();

-- Sample data for testing (optional)
-- Uncomment if you want to add sample data

/*
-- Sample Products
INSERT INTO products (name, description, price, stock, category, status, user_id)
VALUES 
  ('Laptop', 'High-performance laptop', 250000.00, 10, 'Electronics', 'active', auth.uid()),
  ('Smartphone', 'Latest smartphone model', 120000.00, 15, 'Electronics', 'active', auth.uid()),
  ('Office Chair', 'Ergonomic office chair', 35000.00, 8, 'Furniture', 'active', auth.uid()),
  ('Desk Lamp', 'LED desk lamp', 8500.00, 20, 'Home Goods', 'active', auth.uid()),
  ('Wireless Mouse', 'Bluetooth wireless mouse', 6500.00, 25, 'Electronics', 'active', auth.uid());

-- Sample Customers
INSERT INTO customers (name, email, phone, address, status, user_id)
VALUES 
  ('John Doe', 'john@example.com', '08012345678', 'Lagos, Nigeria', 'active', auth.uid()),
  ('Jane Smith', 'jane@example.com', '08023456789', 'Abuja, Nigeria', 'active', auth.uid()),
  ('Michael Johnson', 'michael@example.com', '08034567890', 'Port Harcourt, Nigeria', 'active', auth.uid());
*/
