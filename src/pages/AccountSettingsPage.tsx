import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
    ChevronLeft,
    Download,
    Trash2,
    AlertTriangle,
    Loader2,
    FileJson,
    Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AccountSettingsPage = () => {
    const navigate = useNavigate();
    const { signOut } = useClerk();

    // GDPR mutations and queries
    const deleteAccount = useMutation(api.gdpr.deleteMyAccount);
    const exportData = useQuery(api.gdpr.exportMyData);

    // State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Handle data export
    const handleExportData = async () => {
        if (!exportData) {
            toast.error("Unable to export data. Please try again.");
            return;
        }

        setIsExporting(true);
        try {
            // Create downloadable JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            // Create download link and trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `carfolio-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Your data has been exported successfully!");
        } catch (error) {
            toast.error("Failed to export data. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (!deleteConfirmed) {
            toast.error("Please confirm that you understand this action is irreversible.");
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccount();
            toast.success("Your account has been deleted.");

            // Sign out and redirect to home
            await signOut();
            navigate("/");
        } catch (error) {
            toast.error("Failed to delete account. Please try again or contact support.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Top bar */}
            <div className="flex justify-start items-center p-4 border-b">
                <button onClick={() => navigate('/profile/menu')} className="flex items-center">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    <span>Back</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account data and privacy settings
                    </p>
                </div>

                {/* Data Export Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-primary" />
                            <CardTitle>Export Your Data</CardTitle>
                        </div>
                        <CardDescription>
                            Download a copy of all your data in JSON format. This includes your profile,
                            cars, parts, and activity summary.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleExportData}
                            disabled={isExporting || !exportData}
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Preparing Export...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download My Data
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Privacy Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-500" />
                            <CardTitle>Your Privacy Rights</CardTitle>
                        </div>
                        <CardDescription>
                            We respect your data privacy rights under GDPR and similar regulations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>• <strong>Right to access:</strong> You can export all your data anytime.</p>
                        <p>• <strong>Right to erasure:</strong> You can delete your account and all data.</p>
                        <p>• <strong>Right to portability:</strong> Your data is exported in standard JSON format.</p>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </div>
                        <CardDescription>
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => setShowDeleteDialog(true)}
                            variant="destructive"
                            className="w-full sm:w-auto"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete My Account
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Your Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>
                                This will permanently delete your account and all associated data including:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Your profile information</li>
                                <li>All your cars and their images</li>
                                <li>All parts and modifications</li>
                                <li>Your subscription (if any)</li>
                                <li>Payment history</li>
                            </ul>
                            <p className="font-medium text-foreground">
                                This action is irreversible. Your data cannot be recovered.
                            </p>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="confirm-delete"
                                    checked={deleteConfirmed}
                                    onCheckedChange={(checked) => setDeleteConfirmed(checked === true)}
                                />
                                <label
                                    htmlFor="confirm-delete"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    I understand this action is permanent and cannot be undone
                                </label>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmed(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={!deleteConfirmed || isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete My Account"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AccountSettingsPage;
