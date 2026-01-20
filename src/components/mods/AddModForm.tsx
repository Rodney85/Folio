import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddModFormProps {
  carId: Id<"cars">;
}

const AddModForm: React.FC<AddModFormProps> = ({ carId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const createPart = useMutation(api.parts.createPart);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setUrl('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createPart({
        carId,
        name: title,
        category,
        purchaseUrl: url,
      });
      toast.success(`Successfully added "${title}"`);
      resetForm();
    } catch (error) {
      console.error('Failed to create part:', error);
      toast.error('Failed to add mod. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white/5 border-white/10 backdrop-blur-sm">
      <fieldset disabled={isLoading} className="space-y-4">
        <div>
          <Label htmlFor="mod-title">Title*</Label>
          <Input
            id="mod-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Performance Exhaust"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            required
          />
        </div>
        <div>
          <Label htmlFor="mod-category">Mod Category*</Label>
          <Input
            id="mod-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Performance, Exterior, Wheels..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            required
          />
        </div>
        <div>
          <Label htmlFor="mod-url">Product URL</Label>
          <Input
            id="mod-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product URL"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" onClick={resetForm}>Reset</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-28">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Mod'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
};

export default AddModForm;
