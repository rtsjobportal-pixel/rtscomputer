import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khwiagtqtgwloxzeoiah.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtod2lhZ3RxdGd3bG94emVvaWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTMyMzcsImV4cCI6MjA5Mzk4OTIzN30.CCjqaGnbQGXPLwIkNqYByXx8YwdEFb8d1PXtqWg0enI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

