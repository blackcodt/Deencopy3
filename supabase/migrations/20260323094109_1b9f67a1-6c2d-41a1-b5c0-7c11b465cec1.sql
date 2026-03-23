-- Create storage bucket for app assets (logo, loading image)
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true);

-- Allow public read access to app assets
CREATE POLICY "App assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-assets');

-- Allow authenticated users to upload assets
CREATE POLICY "Authenticated users can upload app assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update app assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'app-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete app assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'app-assets' AND auth.role() = 'authenticated');

-- Create app_settings table for admin configuration
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for app branding)
CREATE POLICY "Anyone can read app settings"
ON public.app_settings FOR SELECT
USING (true);

-- Only authenticated users can modify settings
CREATE POLICY "Authenticated users can insert settings"
ON public.app_settings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings"
ON public.app_settings FOR UPDATE
USING (auth.role() = 'authenticated');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();