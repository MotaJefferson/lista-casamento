'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Users, Pencil, MessageSquare, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' // Importando Input
import { Label } from '@/components/ui/label' // Importando Label
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog' // Importando Dialog
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { RSVPGuest } from '@/lib/types/database'

export default function RSVPList() {
  const [guests, setGuests] = useState<RSVPGuest[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para os Modais
  const [editingGuest, setEditingGuest] = useState<RSVPGuest | null>(null)
  const [newCount, setNewCount] = useState<number>(0)
  const [viewingMessage, setViewingMessage] = useState<string | null>(null)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    const { data, error } = await supabase.from('rsvp_guests').select('*').order('created_at', { ascending: false })
    if (!error && data) setGuests(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar confirmação?')) return
    const { error } = await supabase.from('rsvp_guests').delete().eq('id', id)
    if (!error) {
        setGuests(guests.filter(g => g.id !== id))
        toast({ title: 'Deletado com sucesso' })
    }
  }

  // Função para abrir modal de edição
  const handleEditClick = (guest: RSVPGuest) => {
    setEditingGuest(guest)
    setNewCount(guest.guests_count)
  }

  // Função para salvar a edição
  const handleSaveEdit = async () => {
    if (!editingGuest) return

    try {
        const { error } = await supabase
            .from('rsvp_guests')
            .update({ guests_count: newCount })
            .eq('id', editingGuest.id)

        if (error) throw error

        // Atualiza estado local
        setGuests(guests.map(g => 
            g.id === editingGuest.id ? { ...g, guests_count: newCount } : g
        ))

        toast({ title: 'Quantidade atualizada!' })
        setEditingGuest(null)
    } catch (error) {
        toast({ 
            title: 'Erro ao atualizar', 
            variant: 'destructive' 
        })
    }
  }

  const totalGuests = guests.reduce((sum, g) => sum + g.guests_count, 0)

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Card className="p-4 flex items-center gap-4 bg-primary/10 border-primary/20">
                <div className="p-3 bg-primary text-primary-foreground rounded-full"><Users className="w-6 h-6" /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Confirmado</p>
                    <p className="text-2xl font-bold">{totalGuests} pessoas</p>
                </div>
            </Card>
        </div>

        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guests.map(guest => (
                        <TableRow key={guest.id}>
                            <TableCell className="font-medium">{guest.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{guest.guests_count}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{guest.phone}</div>
                                <div className="text-xs text-muted-foreground">{guest.email}</div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                                {guest.message}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {/* Botão Ver Mensagem */}
                                    {guest.message && (
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => setViewingMessage(guest.message || '')}
                                            title="Ler mensagem completa"
                                        >
                                            <MessageSquare className="w-4 h-4 text-blue-500" />
                                        </Button>
                                    )}

                                    {/* Botão Editar */}
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleEditClick(guest)}
                                        title="Editar quantidade"
                                    >
                                        <Pencil className="w-4 h-4 text-orange-500" />
                                    </Button>

                                    {/* Botão Deletar */}
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleDelete(guest.id)}
                                        title="Remover"
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>

        {/* Modal de Edição de Quantidade */}
        <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Presença</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guests" className="text-right">
                            Qtd. Pessoas
                        </Label>
                        <Input
                            id="guests"
                            type="number"
                            min="1"
                            value={newCount}
                            onChange={(e) => setNewCount(parseInt(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingGuest(null)}>Cancelar</Button>
                    <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Modal de Visualização de Mensagem */}
        <Dialog open={!!viewingMessage} onOpenChange={(open) => !open && setViewingMessage(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mensagem do Convidado</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md italic">
                        "{viewingMessage}"
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={() => setViewingMessage(null)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}