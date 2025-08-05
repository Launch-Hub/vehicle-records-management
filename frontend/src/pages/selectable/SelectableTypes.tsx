import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Database } from 'lucide-react';
import { getSelectableTypes, type SelectableType } from '@/lib/services/selectable';

const SelectableTypes: React.FC = () => {
  const [types, setTypes] = useState<SelectableType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await getSelectableTypes();
        setTypes(data);
      } catch (error) {
        console.error('Error fetching selectable types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Selectable Values Management</h1>
          <p className="text-muted-foreground">
            Manage dynamic selectable values for various fields in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {types.length} Types
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => (
          <Card key={type.type} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{type.displayName}</span>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Type: <code className="bg-muted px-1 rounded">{type.type}</code></p>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/selectable/${type.type}`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Values
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/selectable/${type.type}/create`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {types.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Selectable Types Found</h3>
          <p className="text-muted-foreground">
            Selectable types will appear here once they are configured.
          </p>
        </div>
      )}
    </div>
  );
};

export default SelectableTypes; 