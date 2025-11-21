import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    console.log('[v0] Upload request received')
    const supabase = await createClient()
    
    // Verify Supabase connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('[v0] Auth error:', authError)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('[v0] No file provided')
      return Response.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[v0] File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return Response.json(
        { message: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `gifts/${fileName}`

    console.log('[v0] Generated file path:', filePath)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Check if bucket exists
    console.log('[v0] Checking buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('[v0] Error listing buckets:', listError)
      return Response.json(
        { 
          message: 'Erro ao verificar buckets do storage',
          error: listError.message 
        },
        { status: 500 }
      )
    }

    console.log('[v0] Available buckets:', buckets?.map(b => b.name))
    const bucketExists = buckets?.some(b => b.name === 'gifts')

    if (!bucketExists) {
      console.log('[v0] Bucket "gifts" não encontrado, tentando criar...')
      // Try to create bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('gifts', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/*']
      })

      if (createError) {
        console.error('[v0] Bucket creation error:', createError)
        return Response.json(
          { 
            message: 'Erro ao criar bucket "gifts". Por favor, crie manualmente no Supabase Storage.',
            error: createError.message,
            details: 'O bucket precisa ser criado no Supabase Dashboard > Storage > New Bucket'
          },
          { status: 500 }
        )
      }
      console.log('[v0] Bucket criado com sucesso:', newBucket)
    } else {
      console.log('[v0] Bucket "gifts" encontrado')
    }

    // Upload to Supabase Storage
    console.log('[v0] Iniciando upload...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gifts')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[v0] Upload error details:', uploadError)
      
      // If bucket doesn't exist error
      if (uploadError.message?.includes('Bucket not found') || 
          uploadError.message?.includes('not found') ||
          uploadError.message?.includes('The resource was not found')) {
        return Response.json(
          { 
            message: 'Storage bucket "gifts" não encontrado. Por favor, crie o bucket no Supabase Storage.',
            error: uploadError.message,
            help: 'Acesse Supabase Dashboard > Storage > New Bucket e crie um bucket chamado "gifts" (público)'
          },
          { status: 500 }
        )
      }

      // Permission errors
      if (uploadError.message?.includes('permission') || 
          uploadError.message?.includes('denied') ||
          uploadError.message?.includes('unauthorized')) {
        return Response.json(
          { 
            message: 'Erro de permissão. Verifique as políticas do bucket no Supabase.',
            error: uploadError.message
          },
          { status: 500 }
        )
      }

      return Response.json(
        { 
          message: 'Erro ao fazer upload do arquivo',
          error: uploadError.message,
          code: uploadError.statusCode
        },
        { status: 500 }
      )
    }

    console.log('[v0] Upload successful:', uploadData)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('gifts')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      console.error('[v0] Failed to get public URL')
      return Response.json(
        { message: 'Falha ao obter URL pública' },
        { status: 500 }
      )
    }

    console.log('[v0] Public URL:', urlData.publicUrl)

    return Response.json({
      url: urlData.publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error('[v0] Upload exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return Response.json(
      { 
        message: 'Erro inesperado ao fazer upload',
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

