import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json(
        { message: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validações básicas
    if (!file.type.startsWith('image/')) {
      return Response.json(
        { message: 'O arquivo deve ser uma imagem' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { message: 'A imagem deve ter menos de 5MB' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Caminho do arquivo (sem a pasta 'gifts' no nome do caminho, pois ela é o bucket)
    const filePath = fileName

    // Converter para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload direto para o bucket 'gifts'
    const { error: uploadError } = await supabase.storage
      .from('gifts')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[v0] Upload error:', uploadError)
      return Response.json(
        { 
          message: 'Erro ao salvar imagem no Storage',
          error: uploadError.message 
        },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('gifts')
      .getPublicUrl(filePath)

    return Response.json({
      url: urlData.publicUrl,
      path: filePath,
    })

  } catch (error) {
    console.error('[v0] Upload exception:', error)
    return Response.json(
      { message: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}