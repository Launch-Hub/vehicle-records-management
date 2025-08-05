import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Settings,
  Database 
} from 'lucide-react';
import { 
  getSelectableList, 
  createSelectableValue, 
  updateSelectableValue, 
  deleteSelectableValue,
  type SelectableValue,
  type SelectableListResponse 
} from '@/lib/services/selectable';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.string().min(1, 'Value is required'),
  dictionary: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const SelectableValues: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [values, setValues] = useState<SelectableValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [editingItem, setEditingItem] = useState<SelectableValue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: '',
      dictionary: '',
    },
  });

  const fetchValues = async () => {
    if (!type) return;
    
    try {
      setLoading(true);
      const response: SelectableListResponse = await getSelectableList(type, {
        pageIndex,
        pageSize,
        search: search || undefined,
      });
      setValues(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching values:', error);
      toast.error('Failed to fetch values');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, [type, pageIndex, search]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (editingItem) {
        await updateSelectableValue(type!, editingItem._id, data);
        toast.success('Value updated successfully');
      } else {
        await createSelectableValue(type!, data);
        toast.success('Value created successfully');
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingItem(null);
      fetchValues();
    } catch (error) {
      console.error('Error saving value:', error);
      toast.error('Failed to save value');
    }
  };

  const handleEdit = (item: SelectableValue) => {
    setEditingItem(item);
    form.reset({
      name: item.name || '',
      value: item.value || '',
      dictionary: item.dictionary || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this value?')) return;
    
    try {
      await deleteSelectableValue(type!, id);
      toast.success('Value deleted successfully');
      fetchValues();
    } catch (error) {
      console.error('Error deleting value:', error);
      toast.error('Failed to delete value');
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    form.reset({
      name: '',
      value: '',
      dictionary: '',
    });
    setIsDialogOpen(true);
  };

  const getDisplayName = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!type) {
    return <div>Invalid type</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/selectable">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold capitalize">
              {getDisplayName(type)} Values
            </h1>
            <p className="text-muted-foreground">
              Manage {getDisplayName(type).toLowerCase()} values
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {total} Values
          </Badge>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Value
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Values List
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search values..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Dictionary</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {values.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>
                      {item.dictionary && (
                        <Badge variant="outline">{item.dictionary}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {values.length === 0 && !loading && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Values Found</h3>
              <p className="text-muted-foreground">
                No {getDisplayName(type).toLowerCase()} values have been created yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Value' : 'Create New Value'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dictionary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dictionary (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectableValues; 