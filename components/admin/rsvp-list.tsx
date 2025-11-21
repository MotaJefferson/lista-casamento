'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { RSVPGuest } from '@/lib/types/database'

export default function RSVPList() {
  const [guests, setGuests] = useState<RSVPGuest[]>([])
  const [loading, setLoading] = useState(true)
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
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guests.map(guest => (
                        <TableRow key={guest.id}>
                            <TableCell className="font-medium">{guest.name}</TableCell>
                            <TableCell>{guest.guests_count}</TableCell>
                            <TableCell>
                                <div className="text-sm">{guest.phone}</div>
                                <div className="text-xs text-muted-foreground">{guest.email}</div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                                {guest.message}
                            </TableCell>
                            <TableCell>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(guest.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </div>
  )
}