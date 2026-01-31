import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, Link2, Play, Download } from 'lucide-react'
import Link from 'next/link'

export default async function MaterialsPage() {
  const supabase = await createClient()

  // Fetch materials sorted by latest update
  const { data: materials } = await supabase
    .from('materials')
    .select('*')
    .eq('access_rule', 'ACTIVE_ONLY') // Security check
    .order('updated_at', { ascending: false })

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

  // Group materials by Theme
  const materialsByTheme: Record<string, any[]> = {}
  materials?.forEach((item: any) => {
    const theme = item.theme || 'Geral'
    if (!materialsByTheme[theme]) {
      materialsByTheme[theme] = []
    }
    materialsByTheme[theme].push(item)
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary">MAF Community</h1>
          <nav className="flex items-center gap-6">
            <Link href="/app/feed" className="text-sm font-medium hover:text-primary transition-colors">
              Feed
            </Link>
            <Link href="/app/materials" className="text-sm font-medium text-primary">
              Biblioteca
            </Link>
            <Link href="/app/profile" className="text-sm font-medium hover:text-primary transition-colors">
              Perfil
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Biblioteca Oficial MAF</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Acesse materiais exclusivos, organizados e versionados.
          </p>
        </div>

        {Object.entries(materialsByTheme).length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum material disponível</h3>
            <p className="text-muted-foreground mt-2">A biblioteca está sendo atualizada.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(materialsByTheme).map(([theme, items]) => (
              <section key={theme}>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-xl font-bold text-primary">{theme}</h3>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((material) => (
                    <Card key={material.id} className="group hover:shadow-lg transition-all duration-300 border-muted">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:scale-105 transition-transform">
                            {getIcon(material.type)}
                          </div>
                          <Badge variant="secondary" className="font-mono text-xs">
                            v{material.version || '1.0'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem] leading-tight">
                          {material.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {material.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5 mb-4 max-h-16 overflow-hidden">
                          {material.tags?.map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-gray-500/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button asChild className="w-full gap-2" size="sm">
                          <a href={material.path_or_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            Acessar {material.type}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

import { Button } from '@/components/ui/button'
