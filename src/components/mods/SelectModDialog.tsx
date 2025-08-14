import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id, Doc } from '../../../convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';

interface SelectModDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  carId: Id<"cars">;
  onSelectMod: (part: Doc<"parts">) => void;
}

const SelectModDialog: React.FC<SelectModDialogProps> = ({ isOpen, onOpenChange, carId, onSelectMod }) => {
  const parts = useQuery(api.parts.getCarParts, { carId });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Select a Mod to Link</DialogTitle>
          <DialogDescription>
            Choose one of the mods you've already created for this car.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border border-slate-700">
          <div className="p-4">
            {parts?.length === 0 && (
              <p className="text-slate-400 text-center">No mods created for this car yet. Add one first!</p>
            )}
            <div className="space-y-2">
              {parts?.map((part) => (
                <button
                  key={part._id}
                  onClick={() => onSelectMod(part)}
                  className="w-full text-left p-2 rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <p className="font-semibold">{part.name}</p>
                  <p className="text-sm text-slate-400">{part.category}</p>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">Cancel</Button>
      </DialogContent>
    </Dialog>
  );
};

export default SelectModDialog;
