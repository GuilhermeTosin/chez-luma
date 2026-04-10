import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvedwyxkstpnkwbikivi.supabase.co'
const supabaseAnonKey = 'sb_publishable_j3rFhtFfV5TB7CJ5F0q7gA_8-8dNA26'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
