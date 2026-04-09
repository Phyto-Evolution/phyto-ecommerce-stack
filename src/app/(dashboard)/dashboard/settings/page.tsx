import { getSettings, updateSettings } from "@/actions/settings-actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>

        <form action={updateSettings} className="space-y-4">
          <Input
            label="Store Name"
            name="storeName"
            defaultValue={settings.storeName ?? ""}
            placeholder="My Plant Shop"
          />
          <Input
            label="Store Description"
            name="storeDescription"
            defaultValue={settings.storeDescription ?? ""}
            placeholder="A short description of your store"
          />
          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail ?? ""}
            placeholder="hello@example.com"
          />
          <Input
            label="Currency"
            name="currency"
            defaultValue={settings.currency ?? "INR"}
            placeholder="INR"
          />
          <Input
            label="Timezone"
            name="timezone"
            defaultValue={settings.timezone ?? "Asia/Kolkata"}
            placeholder="Asia/Kolkata"
          />

          <div className="pt-2">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
