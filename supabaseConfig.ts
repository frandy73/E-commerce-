
import { createClient } from '@supabase/supabase-js';

// Enfòmasyon sa yo soti dirèkteman nan pwojè Supabase ou a.
const supabaseUrl = 'https://shtjndcdggcjhxdbcbrj.supabase.co';
const supabaseAnonKey = 'sb_publishable_0Os9QGtEZyO8WDdNQ19I9w_iIxIb_M5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
