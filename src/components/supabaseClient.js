import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cuoesufpdtlrnwhamryy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1b2VzdWZwZHRscm53aGFtcnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Mjk4MTUsImV4cCI6MjA2MDMwNTgxNX0.NWKOugqIxROToOaYKl-geXVSGsvUODNyVyo2S9nWhew'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
