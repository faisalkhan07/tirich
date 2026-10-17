import { getSettings } from "@/lib/products";
import SettingsForm from "@/components/admin/SettingsForm";
import styles from "../dashboard.module.css";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Store Configuration & Operations</h1>
          <p>
            Configure WhatsApp chat routes, COD delivery fees, free delivery limits, and store notices.
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
