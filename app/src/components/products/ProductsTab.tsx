import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, Clock, Trash } from 'lucide-react';
import { use3DProducts } from '@/hooks/use3DProducts';
import { Button } from '@/components/ui/button';

export function ProductsTab() {
    const { products, isLoading, deleteProduct } = use3DProducts();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Produtos</h2>
                <p className="text-slate-500">Visualize os itens cadastrados no sistema</p>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50/50">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5 text-emerald-600" />
                        Catálogo de Produtos 3D
                    </CardTitle>
                    <CardDescription>
                        {products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome da Peça</TableHead>
                                        <TableHead className="text-right">Custo de Fabricação</TableHead>
                                        <TableHead className="text-right">Tempo de Impressão</TableHead>
                                        <TableHead className="text-right">Shopee</TableHead>
                                        <TableHead className="text-right">TikTok</TableHead>
                                        <TableHead className="text-right">Temu</TableHead>
                                        <TableHead className="w-[100px] text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((produto) => (
                                        <TableRow key={produto.id}>
                                            <TableCell className="font-medium text-slate-900">
                                                {produto.name}
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-600 font-semibold">
                                                {formatCurrency(produto.totalCost)}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-600">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {produto.printTimeHours}h {produto.printTimeMinutes}m
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-orange-600">
                                                {produto.shopeePrice ? formatCurrency(produto.shopeePrice) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-800">
                                                {produto.tiktokPrice ? formatCurrency(produto.tiktokPrice) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-[#E86424]">
                                                {produto.temuPrice ? formatCurrency(produto.temuPrice) : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => deleteProduct(produto.id)}
                                                    title="Excluir produto"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {products.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                                <p>Nenhum produto cadastrado no momento.</p>
                                                <p className="text-sm">Vá até a aba "Custo 3D" para adicionar.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
