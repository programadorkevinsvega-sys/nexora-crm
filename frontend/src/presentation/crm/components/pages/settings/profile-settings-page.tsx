"use client"

import { Card } from "@/src/presentation/crm/components/ui/Card"
import { PageHeader } from "@/src/presentation/crm/components/common/PageHeader"
import { Avatar } from "@/src/presentation/crm/components/ui/Avatar"
import { useAuth } from "@/src/presentation/hooks/use-auth"

export function ProfilePage() {
  const { userId, tenantId } = useAuth()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Profile" description="Your account settings" />

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={userId ?? "User"} size="lg" />
          <div>
            <h2 className="text-heading-sm font-sans font-semibold text-paper">User Profile</h2>
            <p className="text-caption text-ash">Account settings and preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-caption text-ash">User ID</p>
            <p className="text-body text-paper">{userId ?? "—"}</p>
          </div>
          <div>
            <p className="text-caption text-ash">Tenant ID</p>
            <p className="text-body text-paper">{tenantId ?? "—"}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
export default ProfilePage
