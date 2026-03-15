import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Edit, Package, Box } from 'lucide-react';
import { useSupplies, type Supply } from '@/hooks/useSupplies';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SuppliesTab() {
  const { supplies, isLoading, createSupply, updateSupply, deleteSupply } = useSupplies();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'filamento',
    pricePaid: '',
    quantity: '',
    unit: 'g',
    color: ''
  });

  const filteredSupplies = supplies.filter(supply => 
    supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (supply?: Supply) => {
    if (supply) {
      setEditingSupply(supply);
      setFormData({
        name: supply.name,
        type: supply.type,
        pricePaid: supply.pricePaid.toString(),
        quantity: supply.quantity.toString(),
        unit: supply.unit,
        color: supply.color || ''
      });
    } else {
      setEditingSupply(null);
      setFormData({
        name: '',
        type: 'filamento',
        pricePaid: '',
        quantity: '',
        unit: 'g',
        color: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        type: formData.type,
        pricePaid: parseFloat(formData.pricePaid) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit,
        color: formData.color || null
      };

      if (editingSupply) {
        await updateSupply(editingSupply.id, data);
      } else {
        await createSupply(data);
      }
      setIsDialogOpen(false);
    } catch (error) {
      alert('Erro ao salvar suprimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja apagar este suprimento?')) {
      try {
        await deleteSupply(id);
      } catch (error) {
        alert('Erro ao deletar suprimento');
      }
    }
  };

  const getBadgeVariant = (type: string) => {
    switch(type) {
      case 'filamento': return 'default';
      case 'embalagem': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Suprimentos</h2>
          <p className="text-slate-500">Gerencie seu estoque de filamentos e embalagens auxiliando na precificação</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" /> Novo Suprimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSupply ? 'Editar Suprimento' : 'Novo Suprimento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome / Descrição</Label>
                <Input 
                  id="name" 
                  autoFocus
                  required
                  placeholder="Ex: Filamento PLA Azul, Caixa Papelão 20x15"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        type: val, 
                        unit: val === 'filamento' ? 'g' : val === 'embalagem' ? 'unidade' : 'unidade' 
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filamento">Filamento</SelectItem>
                      <SelectItem value="embalagem">Embalagem</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type === 'filamento' && (
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor (Opcional)</Label>
                    <Input 
                      id="color" 
                      placeholder="Ex: Azul Celeste"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input 
                    id="quantity" 
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label>Unid. de Medida</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(val) => setFormData({...formData, unit: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sua medida" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="kg">Kilos (kg)</SelectItem>
                      <SelectItem value="unidade">Unidades</SelectItem>
                      <SelectItem value="rolo">Rolos</SelectItem>
                      <SelectItem value="metro">Metros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="pricePaid">Preço Pago</Label>
                  <Input 
                    id="pricePaid" 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="R$ 0,00"
                    value={formData.pricePaid}
                    onChange={(e) => setFormData({...formData, pricePaid: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fazer depois
                </Button>
                <Button type="submit">
                  {editingSupply ? 'Salvar Edição' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-emerald-600" /> Estoque de Insumos
              </CardTitle>
              <CardDescription>Lista de materiais usados para fabricação e despacho</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar suprimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[30%]">Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade Comprada</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Carregando suprimentos...
                    </TableCell>
                  </TableRow>
                ) : filteredSupplies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Box className="h-10 w-10 text-slate-300" />
                        <p>Nenhum suprimento encontrado no estoque.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSupplies.map((supply) => {
                    const unitPrice = supply.pricePaid / supply.quantity;

                    return (
                      <TableRow key={supply.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="font-medium text-slate-900">{supply.name}</div>
                          {supply.color && <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>{supply.color}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(supply.type)} className="capitalize">
                            {supply.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {supply.quantity} {supply.unit}
                          <br />
                          <span className="text-xs text-slate-400">Total Pago: {formatCurrency(supply.pricePaid)}</span>
                        </TableCell>
                        <TableCell className="font-mono text-emerald-600 font-medium">
                          {formatCurrency(unitPrice)} <span className="text-xs text-slate-500 font-sans">/ {supply.unit}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              onClick={() => handleOpenDialog(supply)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(supply.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
