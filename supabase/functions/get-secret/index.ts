import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../fetch-financial-data/utils/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name } = await req.json()
    
    if (!name) {
      throw new Error('Secret name is required')
    }

    const secret = Deno.env.get(name)
    if (!secret) {
      throw new Error(`Secret ${name} not found`)
    }

    return new Response(
      JSON.stringify({ [name]: secret }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})