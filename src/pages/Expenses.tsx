import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expensesApi } from '@/db/api';
import type { Expense } from '@/types/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const expenseTypes = [
  { value: 'rent', label: '租金' },
  { value: 'utilities', label: '水电费' },
  { value: 'salary', label: '工资' },
  { value: 'marketing', label: '营销费用' },
  { value: 'maintenance', label: '维护费用' },
  { value: 'insurance', label: '保险费用' },
  { value: 'tax', label: '税费' },
  { value: 'other', label: '其他' },
];

export default function Expenses() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [formData, setFormData] = useState({
    expense_type: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.getAll();
      // 按月份筛选
      const filtered = data.filter(expense => 
        expense.expense_date.startsWith(selectedMonth)
      );
      setExpenses(filtered);
    } catch (error) {
      console.error('加载费用数据失败:', error);
      toast.error('加载费用数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast.error('用户信息未加载，请刷新页面重试');
      return;
    }
    
    try {
      // 添加 created_by 字段
      const expenseData = {
        ...formData,
        created_by: profile.id,
      };
      
      await expensesApi.create(expenseData as any);
      toast.success('费用记录已创建');
      setDialogOpen(false);
      resetForm();
      loadExpenses();
    } catch (error) {
      console.error('创建费用记录失败:', error);
      toast.error('创建记录失败');
    }
  };

  const resetForm = () => {
    setFormData({
      expense_type: '',
      amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const getExpenseTypeLabel = (type: string) => {
    return expenseTypes.find(t => t.value === type)?.label || type;
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">费用管理</h1>
          <p className="text-muted-foreground mt-2">
            记录和管理车行运营费用
            {!isAdmin && (
              <span className="ml-2 text-xs text-amber-600">
                （员工权限：可创建费用记录，不可修改）
              </span>
            )}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              添加费用
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加费用记录</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense_type">费用类型</Label>
                <Select
                  value={formData.expense_type}
                  onValueChange={(value) => setFormData({ ...formData, expense_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择费用类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">金额（元）</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date">费用日期</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">费用说明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 @md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">本月总费用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              共 {expenses.length} 笔费用
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">选择月份</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="max-w-xs"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>费用记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>说明</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.expense_date}</TableCell>
                  <TableCell>{getExpenseTypeLabel(expense.expense_type)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="font-medium">
                    ¥{Number(expense.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {expense.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    本月暂无费用记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
