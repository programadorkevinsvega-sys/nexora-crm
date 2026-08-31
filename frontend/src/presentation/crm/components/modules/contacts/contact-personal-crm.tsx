"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/src/presentation/crm/components/ui/Card"
import { Skeleton } from "@/src/presentation/crm/components/ui/Skeleton"
import { EntityCard } from "@/src/presentation/crm/components/common/EntityCard"
import { ApiPersonalCrmRepository } from "@/src/infrastructure/crm/repositories/personal-crm/api-personal-crm.repository"

export interface ContactPersonalCrmProps {
  contactId: string
}

export function ContactPersonalCrm({ contactId }: ContactPersonalCrmProps) {
  const { data: lifeEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ["personal-crm-life-events", contactId],
    queryFn: () => ApiPersonalCrmRepository.listLifeEvents({ contactId }),
    enabled: !!contactId,
  })

  const { data: gifts, isLoading: loadingGifts } = useQuery({
    queryKey: ["personal-crm-gifts", contactId],
    queryFn: () => ApiPersonalCrmRepository.listGifts({ contactId }),
    enabled: !!contactId,
  })

  const { data: debts, isLoading: loadingDebts } = useQuery({
    queryKey: ["personal-crm-debts", contactId],
    queryFn: () => ApiPersonalCrmRepository.listDebts({ contactId }),
    enabled: !!contactId,
  })

  const { data: reminders, isLoading: loadingReminders } = useQuery({
    queryKey: ["personal-crm-reminders", contactId],
    queryFn: () => ApiPersonalCrmRepository.listReminders({ contactId }),
    enabled: !!contactId,
  })

  const { data: pets, isLoading: loadingPets } = useQuery({
    queryKey: ["personal-crm-pets", contactId],
    queryFn: () => ApiPersonalCrmRepository.listPets({ contactId }),
    enabled: !!contactId,
  })

  if (loadingEvents || loadingGifts || loadingDebts || loadingReminders || loadingPets) {
    return <Skeleton className="h-48" />
  }

  return (
    <div className="space-y-4">
      <EntityCard title="Life Events">
        {lifeEvents && lifeEvents.data.length > 0 ? (
          <div className="space-y-2">
            {lifeEvents.data.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-1">
                <span className="text-body text-paper">{event.title}</span>
                <span className="text-caption text-ash">{new Date(event.happenedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ash">No life events</p>
        )}
      </EntityCard>

      <EntityCard title="Gifts">
        {gifts && gifts.data.length > 0 ? (
          <div className="space-y-2">
            {gifts.data.map((gift) => (
              <div key={gift.id} className="flex items-center justify-between py-1">
                <span className="text-body text-paper">{gift.name}</span>
                {gift.value != null && (
                  <span className="text-caption text-ash">${gift.value}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ash">No gifts recorded</p>
        )}
      </EntityCard>

      <EntityCard title="Debts">
        {debts && debts.data.length > 0 ? (
          <div className="space-y-2">
            {debts.data.map((debt) => (
              <div key={debt.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className={`text-body ${debt.isSettled ? "text-ash line-through" : "text-paper"}`}>
                    {debt.type === "LENT" ? "Lent" : "Borrowed"} ${debt.amount}
                  </span>
                </div>
                {debt.description && <span className="text-caption text-ash">{debt.description}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ash">No debts</p>
        )}
      </EntityCard>

      <EntityCard title="Reminders">
        {reminders && reminders.data.length > 0 ? (
          <div className="space-y-2">
            {reminders.data.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between py-1">
                <span className={`text-body ${reminder.isDone ? "text-ash line-through" : "text-paper"}`}>
                  {reminder.title}
                </span>
                <span className="text-caption text-ash">{new Date(reminder.remindAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ash">No reminders</p>
        )}
      </EntityCard>

      <EntityCard title="Pets">
        {pets && pets.data.length > 0 ? (
          <div className="space-y-2">
            {pets.data.map((pet) => (
              <div key={pet.id} className="flex items-center justify-between py-1">
                <span className="text-body text-paper">{pet.name}</span>
                <span className="text-caption text-ash">{pet.species}{pet.breed ? ` - ${pet.breed}` : ""}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ash">No pets</p>
        )}
      </EntityCard>
    </div>
  )
}
