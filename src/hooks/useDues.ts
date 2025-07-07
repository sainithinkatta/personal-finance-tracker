
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Due, CreateDueData, UpdateDueData } from '@/types/due';
import { useToast } from '@/hooks/use-toast';

export const useDues = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: dues = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Due[];
    },
  });

  const addDueMutation = useMutation({
    mutationFn: async (newDue: CreateDueData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('dues')
        .insert([{ ...newDue, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dues'] });
      toast({
        title: 'Success',
        description: 'Due added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add due',
        variant: 'destructive',
      });
      console.error('Error adding due:', error);
    },
  });

  const updateDueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDueData }) => {
      const { data: updatedData, error } = await supabase
        .from('dues')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dues'] });
      toast({
        title: 'Success',
        description: 'Due updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update due',
        variant: 'destructive',
      });
      console.error('Error updating due:', error);
    },
  });

  const deleteDueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dues'] });
      toast({
        title: 'Success',
        description: 'Due deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete due',
        variant: 'destructive',
      });
      console.error('Error deleting due:', error);
    },
  });

  const markAsSettledMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('dues')
        .update({ 
          status: 'Settled', 
          settled_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dues'] });
      toast({
        title: 'Success',
        description: 'Due marked as settled',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark due as settled',
        variant: 'destructive',
      });
      console.error('Error marking due as settled:', error);
    },
  });

  return {
    dues,
    isLoading,
    error,
    addDue: addDueMutation.mutate,
    updateDue: updateDueMutation.mutate,
    deleteDue: deleteDueMutation.mutate,
    markAsSettled: markAsSettledMutation.mutate,
    isAdding: addDueMutation.isPending,
    isUpdating: updateDueMutation.isPending,
    isDeleting: deleteDueMutation.isPending,
  };
};
