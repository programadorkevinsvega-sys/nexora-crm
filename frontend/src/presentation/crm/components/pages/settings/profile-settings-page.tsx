"use client"

import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { ProfileSettingsTab } from "./profile-settings-tab"

export function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Mi Perfil de Usuario"
        description="Gestiona tu información personal, correo, firma comercial y preferencias de cuenta."
      />
      <ProfileSettingsTab />
    </div>
  )
}

export default ProfilePage
