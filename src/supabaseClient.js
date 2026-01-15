import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ymrhsiapbtbmvyrxzazk.supabase.co'
const supabaseAnonKey = 'sb_publishable_kSApRJhEsKI8ZIIsZem-ww_Uak90Jfd'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
