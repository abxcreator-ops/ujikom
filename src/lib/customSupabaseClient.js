import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqhxdpcsgemjmbrmrkfz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaHhkcGNzZ2Vtam1icm1ya2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDk1NzYsImV4cCI6MjA3NDg4NTU3Nn0.kOEZJN30nSWMco9Aa4r6DK3u6hMGgG-sK11VVbLoc5g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);