import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeletePortfolioDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioName: string;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export const DeletePortfolioDialog = ({
  isOpen,
  onOpenChange,
  portfolioName,
  onConfirmDelete,
  isDeleting,
}: DeletePortfolioDialogProps) => {
  const handleDelete = async () => {
    try {
      await onConfirmDelete();
      // Important: only close the dialog after successful deletion
      onOpenChange(false);
    } catch (error) {
      // Error is already handled in the parent component
      // We don't close the dialog here so the user can retry
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isDeleting ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Portfolio</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the portfolio "{portfolioName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                Deleting...
              </span>
            ) : (
              "Delete Portfolio"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};