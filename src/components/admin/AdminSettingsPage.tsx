import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Save, Globe, Mail } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const AdminSettingsPage = () => {
    const { toast } = useToast();
    const settingsData = useQuery(api.adminSettings.getSettings);
    const updateSetting = useMutation(api.adminSettings.updateSetting);

    const [settings, setSettings] = useState({
        siteName: "",
        supportEmail: "",
        maintenanceMode: false,
        allowRegistrations: true,
        requireEmailVerification: true,
    });

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settingsData) {
            setSettings({
                siteName: settingsData.siteName || "",
                supportEmail: settingsData.supportEmail || "",
                maintenanceMode: settingsData.maintenanceMode ?? false,
                allowRegistrations: settingsData.allowRegistrations ?? true,
                requireEmailVerification: settingsData.requireEmailVerification ?? true,
            });
        }
    }, [settingsData]);

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            // Include all settings in the update
            const updates = [
                updateSetting({ key: "siteName", value: settings.siteName }),
                updateSetting({ key: "supportEmail", value: settings.supportEmail }),
                updateSetting({ key: "maintenanceMode", value: settings.maintenanceMode }),
                updateSetting({ key: "allowRegistrations", value: settings.allowRegistrations }),
                updateSetting({ key: "requireEmailVerification", value: settings.requireEmailVerification }),
            ];

            await Promise.all(updates);

            toast({
                title: "Settings saved",
                description: "System configuration has been updated successfully.",
            });
            setHasChanges(false);
        } catch (error) {
            toast({
                title: "Error saving settings",
                description: "Failed to update configuration.",
                variant: "destructive",
            });
        }
    };

    if (!settingsData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage global application configuration.</p>
                </div>
                <Button onClick={handleSave} disabled={!hasChanges}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-muted/50 p-1">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                        <CardHeader>
                            <CardTitle>General Configuration</CardTitle>
                            <CardDescription>
                                Basic settings for the application identity and access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="siteName">Site Name</Label>
                                <div className="flex items-center gap-2 relative">
                                    <Globe className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="siteName"
                                        value={settings.siteName}
                                        onChange={(e) => handleChange("siteName", e.target.value)}
                                        className="pl-9 bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Disable access for non-admin users. Useful during updates.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 mt-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage user registration and authentication rules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow Registrations</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Toggle to open or close new user sign-ups.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.allowRegistrations}
                                    onCheckedChange={(checked) => handleChange("allowRegistrations", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Require Email Verification</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enforce email verification before allowing access.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.requireEmailVerification}
                                    onCheckedChange={(checked) => handleChange("requireEmailVerification", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-4 mt-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                        <CardHeader>
                            <CardTitle>Email Configuration</CardTitle>
                            <CardDescription>
                                Contact addresses for system notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="supportEmail">Support Email</Label>
                                <div className="flex items-center gap-2 relative">
                                    <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="supportEmail"
                                        value={settings.supportEmail}
                                        onChange={(e) => handleChange("supportEmail", e.target.value)}
                                        className="pl-9 bg-background/50"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSettingsPage;
