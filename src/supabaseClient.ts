import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzkjrlscuhvefezrybch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a2pybHNjdWh2ZWZlenJ5YmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjY0MDQsImV4cCI6MjA4MTkwMjQwNH0.bWSNEiGuZenO4mP3aTJYPToq1tZgf4xK34uE9c4Clrk';

export const supabase = createClient(supabaseUrl, supabaseKey);