import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, Link2, Play } from 'lucide-react'
import Link from 'next/link'

export default async function MaterialsPage() {
  const supabase = await createClient()
  
  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false })

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-6 w-6" />
      case 'VIDEO':
        return <Play className="h-6 w-6" />
      case 'LINK':
        return <Link2 className="h-6 w-6" />
      default:
        return <BookOpen className="h-6 w-6" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">MAF Community</h1>
          <nav className="flex items-center gap-4">
            <Link href="/app/feed" className="text-sm font-medium">
              Feed
            </Link>
            <Link href="/app/materials" className="text-sm font-medium text-primary">
              Biblioteca
            </Link>
            <Link href="/app/profile" className="text-sm font-medium">
              Perfil
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Biblioteca de Materiais</h2>
          <p className="text-muted-foreground mt-2">
            Acesse PDFs, vídeos, documentos e recursos exclusivos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials?.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {getIcon(material.type)}
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    {material.type}
                  </span>
                </div>
                <CardTitle className="mt-4">{material.title}</CardTitle>
                <CardDescription>{material.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {material.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={material.path_or_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Acessar material →
                </a>
              </CardContent>
            </Card>
          ))}

          {(!materials || materials.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                Nenhum material disponível no momento.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
