# CRM Frontend Specification

## Stack & Constraints

| Rule | Detail |
|---|---|
| **Framework** | Next.js App Router (NO Pages Router) |
| **Base URL** | `http://localhost:3006/api` (BFF) |
| **Auth** | JWT via `Authorization: Bearer <token>` |
| **Tenant** | `X-Tenant-Id: <uuid>` on every request |
| **Pagination** | Cursor-based (`cursor: string \| null`, `limit: number`) |
| **Default page size** | 20 items, max 100 |
| **Cache** | Redis (BFF-managed, 30s TTL per entity prefix) |
| **Communication** | REST to BFF only. Never gRPC/Kafka/NATS/DB directly from browser. |

### Response Shapes

```typescript
// Paginated list
{ data: T[], nextCursor: string | null }

// Single entity
// The entity object directly (no wrapper)
```

---

## 1. Page Routes & Layout

All pages use Next.js App Router with Route Groups. CRM routes are under `app/(crm)/` (no URL prefix), ERP routes under `app/(erp)/` (future).
The CRM layout at `app/(crm)/layout.tsx` provides the app shell (sidebar + header + providers).

```
/ (Dashboard)                                ← app/(crm)/page.tsx
│
├── companies/                               ← app/(crm)/companies/
│   ├── page.tsx              # Company list
│   └── [id]/page.tsx         # Company detail (profile + related entities)
│
├── contacts/                                ← app/(crm)/contacts/
│   ├── page.tsx              # Contact list (search, filter by lead status, starred)
│   └── [id]/page.tsx         # Contact detail (profile + interactions + personal CRM)
│
├── pipelines/                               ← app/(crm)/pipelines/
│   ├── page.tsx              # Pipeline list
│   ├── [id]/board/page.tsx   # Kanban board (drag & drop deals across stages)
│   └── deals/
│       ├── [dealId]/page.tsx # Deal detail (info + activities + quotes)
│       └── new/page.tsx      # Create deal (or modal)
│
├── notes/                    # Interactions   ← app/(crm)/notes/page.tsx
├── tasks/                    # Interactions   ← app/(crm)/tasks/page.tsx
├── calls/                    # Interactions   ← app/(crm)/calls/page.tsx
│
├── campaigns/                               ← app/(crm)/campaigns/
│   ├── page.tsx              # Campaign list
│   ├── [id]/page.tsx         # Campaign detail + members
│   ├── new/page.tsx          # Create campaign
│   └── [id]/edit/page.tsx    # Edit campaign
│
├── quotes/                   # Sales          ← app/(crm)/quotes/
│   ├── page.tsx              # Quote list
│   └── [id]/page.tsx         # Quote detail (send/accept/reject)
├── contracts/                               ← app/(crm)/contracts/
│   ├── page.tsx              # Contract list
│   ├── [id]/page.tsx         # Contract detail (renew/change status)
│   ├── new/page.tsx          # Create contract
│   └── [id]/edit/page.tsx    # Edit contract
│
├── sales-teams/                             ← app/(crm)/sales-teams/
│   ├── page.tsx              # Team list
│   ├── [id]/page.tsx         # Team detail (members + quotas grid)
│   ├── new/page.tsx          # Create team
│   └── [id]/edit/page.tsx    # Edit team
│
├── support/                                 ← app/(crm)/support/
│   ├── tickets/                             ← app/(crm)/support/tickets/
│   │   ├── page.tsx          # Ticket list (status/priority/assignee filters)
│   │   ├── [id]/page.tsx     # Ticket detail (thread + replies)
│   │   └── new/page.tsx      # Create ticket
│   └── helpdesk/                            ← app/(crm)/support/helpdesk/
│       ├── conversations/
│       │   ├── page.tsx      # Multi-mailbox conversation inbox
│       │   └── [id]/page.tsx # Conversation detail (threads)
│       └── settings/
│           ├── mailboxes/page.tsx    # Mailbox management
│           └── agents/page.tsx       # Agent profile/availability
│
├── affiliates/                              ← app/(crm)/affiliates/
│   ├── programs/
│   │   ├── page.tsx          # Program list
│   │   └── [id]/page.tsx     # Program detail
│   ├── page.tsx              # Affiliates list
│   └── [id]/page.tsx         # Affiliate detail (commissions + payouts)
│
├── loyalty/                                 ← app/(crm)/loyalty/
│   └── segments/
│       └── page.tsx          # Customer segment management
│
└── settings/                                ← app/(crm)/settings/
    ├── tags/page.tsx         # Tag management (global CRM)
    └── profile/page.tsx      # User profile
```

---

## 2. Complete BFF API Map

Every endpoint requires: `Authorization: Bearer <jwt>` + `X-Tenant-Id: <uuid>` headers.

### 2.1 Companies — `api/companies`

| Method | Path | Query Params | Body | Returns |
|---|---|---|---|---|
| `GET` | `/api/companies` | `cursor?`, `limit?`, `search?`, `industry?` | — | `PaginatedResult<Company>` |
| `POST` | `/api/companies` | — | `name`(req), `taxId?`, `website?`, `industry?`, `numberOfEmployees?`, `annualRevenue?`, `description?`, `parentCompanyId?` | `Company` |
| `GET` | `/api/companies/:id` | — | — | `Company` |
| `PUT` | `/api/companies/:id` | — | Partial of create fields | `Company` |
| `DELETE` | `/api/companies/:id` | — | — | `void (204)` |

```typescript
interface Company {
  id: string
  tenantId: string
  name: string
  taxId: string | null
  website: string | null
  industry: string | null
  numberOfEmployees: number | null
  annualRevenue: string | null
  description: string | null
  parentCompanyId: string | null
  createdAt: string
  updatedAt: string
}
```

### 2.2 Contacts — `api/contacts`

| Method | Path | Query Params | Body | Returns |
|---|---|---|---|---|
| `GET` | `/api/contacts` | `cursor?`, `limit?`, `search?`, `leadStatus?`, `companyId?`, `isStarred?` | — | `PaginatedResult<Contact>` |
| `POST` | `/api/contacts` | — | `firstName`(req), `lastName?`, `email?`, `phone?`, `companyId?`, `jobTitle?`, `leadSource?`, `leadStatus?`, `streetAddress?`, `city?`, `stateProvince?`, `postalCode?`, `country?`, `birthDate?`, `isStarred?`, `avatarUrl?`, `metadata?` | `Contact` |
| `GET` | `/api/contacts/:id` | — | — | `Contact` |
| `PUT` | `/api/contacts/:id` | — | Partial of create fields | `Contact` |
| `DELETE` | `/api/contacts/:id` | — | — | `void` |

```typescript
interface Contact {
  id: string
  tenantId: string
  companyId: string | null
  firstName: string
  lastName: string | null
  identificationType: string | null
  identificationNumber: string | null
  verificationDigit: string | null
  email: string | null
  phone: string | null
  birthDate: string | null
  streetAddress: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
  latitude: string | null
  longitude: string | null
  nickname: string | null
  gender: string | null
  isStarred: boolean
  isDeceased: boolean
  stayInTouchFrequencyDays: number | null
  lastTalkedToAt: string | null
  taxRegime: string | null
  isTaxLiable: boolean
  jobTitle: string | null
  leadSource: string | null
  leadStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED'
  loyaltyPoints: number
  avatarUrl: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
```

### 2.3 Pipelines + Deals — `api/pipelines`

| Method | Path | Query Params | Body | Returns |
|---|---|---|---|---|
| `GET` | `/api/pipelines` | — | — | `Pipeline[]` |
| `POST` | `/api/pipelines` | — | `name`(req) | `Pipeline` |
| `GET` | `/api/pipelines/:id` | — | — | `PipelineBoard` |
| `PUT` | `/api/pipelines/:id` | — | `name?` | `Pipeline` |
| `DELETE` | `/api/pipelines/:id` | — | — | `void` |
| `POST` | `/api/pipelines/:pipelineId/stages` | — | `name`(req), `displayOrder`(req), `probabilityPercent?` | `PipelineStage` |
| `PUT` | `/api/pipelines/:pipelineId/stages/reorder` | — | `stageIds: string[]` | `PipelineStage[]` |
| `GET` | `/api/pipelines/deals` | `pipelineId?`, `stageId?`, `status?`, `contactId?`, `companyId?`, `assignedUserId?`, `search?`, `cursor?`, `limit?` | — | `PaginatedResult<Deal>` |
| `POST` | `/api/pipelines/deals` | — | `pipelineId`(req), `stageId`(req), `name`(req), `amount?`, `expectedCloseDate?`, `contactId?`, `companyId?`, `assignedUserId?` | `Deal` |
| `GET` | `/api/pipelines/deals/:dealId` | — | — | `Deal` |
| `PUT` | `/api/pipelines/deals/:dealId` | — | `name?`, `amount?`, `expectedCloseDate?`, `assignedUserId?` | `Deal` |
| `PUT` | `/api/pipelines/deals/:dealId/move` | — | `stageId`(req) | `Deal` |
| `PUT` | `/api/pipelines/deals/:dealId/win` | — | `amount?` | `Deal` |
| `PUT` | `/api/pipelines/deals/:dealId/lose` | — | `lostReasonId?`, `lostNotes?` | `Deal` |
| `DELETE` | `/api/pipelines/deals/:dealId` | — | — | `void` |

```typescript
interface Pipeline { id: string; tenantId: string; name: string; createdAt: string }

interface PipelineBoard {
  pipeline: { id: string; name: string }
  stages: Array<{
    id: string
    name: string
    probabilityPercent: number | null
    displayOrder: number
    deals: Deal[]
  }>
}

interface PipelineStage {
  id: string
  tenantId: string
  pipelineId: string
  name: string
  probabilityPercent: number | null
  displayOrder: number
  createdAt: string
}

interface Deal {
  id: string
  tenantId: string
  pipelineId: string
  stageId: string
  contactId: string | null
  companyId: string | null
  name: string
  amount: string | null
  expectedCloseDate: string | null
  status: 'OPEN' | 'WON' | 'LOST'
  assignedUserId: string | null
  lostReasonId: string | null
  lostNotes: string | null
  partnerId: string | null
  createdAt: string
  updatedAt: string
}
```

### 2.4 Interactions — `api/notes`, `api/tasks`, `api/calls`

#### Notes

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/notes` | `cursor?`, `limit?`, `contactId?`, `companyId?`, `dealId?`, `authorUserId?` | `PaginatedResult<Note>` |
| `POST` | `/api/notes` | `content`(req), `contactId?`, `companyId?`, `dealId?` | `Note` |
| `GET` | `/api/notes/:id` | — | `Note` |
| `PUT` | `/api/notes/:id` | `content`(req) | `Note` |
| `DELETE` | `/api/notes/:id` | — | `void` |

```typescript
interface Note {
  id: string
  tenantId: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  content: string
  authorUserId: string
  createdAt: string
  updatedAt: string
}
```

#### Tasks

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/tasks` | `cursor?`, `limit?`, `assignedUserId?`, `isCompleted?`, `contactId?` | `PaginatedResult<Task>` |
| `POST` | `/api/tasks` | `title`(req), `dueDate`(req), `assignedUserId`(req), `description?`, `contactId?`, `companyId?`, `dealId?` | `Task` |
| `GET` | `/api/tasks/:id` | — | `Task` |
| `PUT` | `/api/tasks/:id` | `title?`, `description?`, `dueDate?`, `isCompleted?` | `Task` |
| `DELETE` | `/api/tasks/:id` | — | `void` |

```typescript
interface Task {
  id: string
  tenantId: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  title: string
  description: string | null
  dueDate: string
  isCompleted: boolean
  assignedUserId: string
  createdAt: string
  updatedAt: string
}
```

#### Calls

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/calls` | `cursor?`, `limit?`, `contactId?`, `callType?` | `PaginatedResult<Call>` |
| `POST` | `/api/calls` | `callType`(req), `happenedAt`(req), `contactId?`, `durationSeconds?`, `summary?` | `Call` |
| `GET` | `/api/calls/:id` | — | `Call` |

```typescript
interface Call {
  id: string
  tenantId: string
  contactId: string | null
  callType: 'INBOUND' | 'OUTBOUND' | 'MEETING'
  durationSeconds: number | null
  summary: string | null
  happenedAt: string
  authorUserId: string
  createdAt: string
}
```

### 2.5 Support Tickets — `api/tickets`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/tickets` | `cursor?`, `limit?`, `status?`, `priority?`, `assignedUserId?`, `contactId?` | `PaginatedResult<SupportTicket>` |
| `POST` | `/api/tickets` | `subject`(req), `description`(req), `priority?`, `contactId?` | `SupportTicket` |
| `GET` | `/api/tickets/:id` | — | `SupportTicket` |
| `PATCH` | `/api/tickets/:id/status` | `status`(req) | `SupportTicket` |
| `PATCH` | `/api/tickets/:id/assign` | `assignedUserId`(req) | `SupportTicket` |
| `POST` | `/api/tickets/:id/replies` | `message`(req), `authorType`(req), `authorId`(req), `isInternalNote?` | `TicketReply` |
| `GET` | `/api/tickets/:id/replies` | — | `TicketReply[]` |

```typescript
interface SupportTicket {
  id: string
  tenantId: string
  contactId: string | null
  subject: string
  description: string
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED'
  priority: string // default 'MEDIUM'
  assignedUserId: string | null
  slaId: string | null
  firstResponseAt: string | null
  slaBreachAt: string | null
  isEscalated: boolean
  createdAt: string
  updatedAt: string
}

interface TicketReply {
  id: string
  tenantId: string
  ticketId: string
  authorType: 'CUSTOMER' | 'AGENT' | 'SYSTEM'
  authorId: string
  message: string
  isInternalNote: boolean
  createdAt: string
}
```

### 2.6 Campaigns — `api/campaigns`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/campaigns` | `cursor?`, `limit?`, `status?`, `type?` | `PaginatedResult<Campaign>` |
| `POST` | `/api/campaigns` | `name`(req), `type?`, `startDate?`, `endDate?`, `budgetedCost?`, `expectedRevenue?` | `Campaign` |
| `GET` | `/api/campaigns/:id` | — | `Campaign` |
| `PUT` | `/api/campaigns/:id` | Partial create | `Campaign` |
| `PATCH` | `/api/campaigns/:id/status` | `status`(req) | `Campaign` |
| `DELETE` | `/api/campaigns/:id` | — | `void` |
| `GET` | `/api/campaigns/:id/members` | `cursor?`, `limit?` | `PaginatedResult<CampaignMember>` |
| `POST` | `/api/campaigns/:id/members` | `contactId`(req) | `CampaignMember` |
| `PATCH` | `/api/campaigns/members/:memberId/status` | `status`(req) | `{ id }` |

```typescript
interface Campaign {
  id: string
  tenantId: string
  name: string
  type: string | null
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string | null
  endDate: string | null
  budgetedCost: string | null
  actualCost: string | null
  expectedRevenue: string | null
  createdAt: string
  updatedAt: string
}

interface CampaignMember {
  id: string
  tenantId: string
  campaignId: string
  contactId: string
  status: 'SENT' | 'OPENED' | 'CLICKED' | 'RESPONDED' | 'BOUNCED' | 'UNSUBSCRIBED'
  respondedAt: string | null
  createdAt: string
}
```

### 2.7 Quotes & Contracts — `api/quotes`, `api/contracts`

#### Quotes

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/quotes` | `cursor?`, `limit?`, `dealId?`, `status?` | `PaginatedResult<Quote>` |
| `POST` | `/api/quotes` | `dealId`(req), `quoteNumber`(req), `validUntil`(req), `subtotal?`, `taxTotal?`, `grandTotal?`, `termsAndConditions?` | `Quote` |
| `GET` | `/api/quotes/:id` | — | `Quote` |
| `POST` | `/api/quotes/:id/send` | — | `Quote` |
| `POST` | `/api/quotes/:id/accept` | — | `Quote` |
| `POST` | `/api/quotes/:id/reject` | `reason`(req) | `Quote` |

#### Contracts

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/contracts` | `cursor?`, `limit?`, `companyId?`, `status?` | `PaginatedResult<Contract>` |
| `POST` | `/api/contracts` | `companyId`(req), `name`(req), `startDate`(req), `ownerUserId`(req), `dealId?`, `endDate?`, `autoRenew?`, `mrrValue?` | `Contract` |
| `GET` | `/api/contracts/:id` | — | `Contract` |
| `PUT` | `/api/contracts/:id` | Partial create | `Contract` |
| `POST` | `/api/contracts/:id/renew` | — | `Contract` |
| `PATCH` | `/api/contracts/:id/status` | `status`(req) | `Contract` |

```typescript
interface Quote {
  id: string
  tenantId: string
  dealId: string
  quoteNumber: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  validUntil: string
  termsAndConditions: string | null
  subtotal: string | null
  taxTotal: string | null
  grandTotal: string | null
  createdAt: string
  updatedAt: string
}

interface Contract {
  id: string
  tenantId: string
  companyId: string
  dealId: string | null
  name: string
  startDate: string
  endDate: string | null
  autoRenew: boolean
  mrrValue: string | null
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED'
  ownerUserId: string
  createdAt: string
  updatedAt: string
}
```

### 2.8 Sales Teams — `api/sales-teams`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/sales-teams` | `cursor?`, `limit?`, `search?` | `PaginatedResult<SalesTeam>` |
| `POST` | `/api/sales-teams` | `name`(req), `managerUserId?`, `monthlyTarget?` | `SalesTeam` |
| `GET` | `/api/sales-teams/:id` | — | `SalesTeam` |
| `PUT` | `/api/sales-teams/:id` | Partial | `SalesTeam` |
| `DELETE` | `/api/sales-teams/:id` | — | `void` |
| `POST` | `/api/sales-teams/:id/members` | `userId`(req) | `void` |
| `DELETE` | `/api/sales-teams/:id/members/:userId` | — | `void` |
| `GET` | `/api/sales-teams/:id/members` | — | `unknown[]` |
| `POST` | `/api/sales-teams/:id/quotas` | `userId`(req), `periodMonth`(req), `periodYear`(req), `targetAmount`(req) | `SalesQuota` |
| `GET` | `/api/sales-teams/:id/quotas` | `cursor?`, `limit?`, `periodMonth?`, `periodYear?` | `PaginatedResult<SalesQuota>` |
| `GET` | `/api/sales-teams/quotas/:quotaId` | — | `SalesQuota` |
| `PATCH` | `/api/sales-teams/quotas/:quotaId/achieved` | `achievedAmount`(req) | `SalesQuota` |

```typescript
interface SalesTeam {
  id: string
  tenantId: string
  name: string
  managerUserId: string | null
  monthlyTarget: string | null
  createdAt: string
  updatedAt: string
}

interface SalesQuota {
  id: string
  tenantId: string
  userId: string
  teamId: string | null
  periodMonth: number
  periodYear: number
  targetAmount: string
  achievedAmount: string | null
  createdAt: string
}
```

### 2.9 Helpdesk — `api/helpdesk`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/helpdesk/conversations` | `mailboxId?`, `status?`, `assigneeUserId?`, `priority?`, `cursor?`, `limit?` | `PaginatedResult<HelpdeskConversation>` |
| `POST` | `/api/helpdesk/conversations` | `mailboxId`(req), `subject`(req), `customerEmail`(req), `customerId?`, `assigneeUserId?`, `status?`, `priority?`, `sourceChannel?`, `estimatedHours?`, `dueDate?`, `isInternal?` | `HelpdeskConversation` |
| `GET` | `/api/helpdesk/conversations/:id` | — | `HelpdeskConversation` |
| `PATCH` | `/api/helpdesk/conversations/:id/status` | `status`(req) | `void` |
| `PATCH` | `/api/helpdesk/conversations/:id/assign` | `assigneeUserId`(req) | `void` |
| `POST` | `/api/helpdesk/conversations/:id/resolve` | — | `void` |
| `GET` | `/api/helpdesk/conversations/:id/threads` | — | `PaginatedResult<HelpdeskThread>` |
| `POST` | `/api/helpdesk/conversations/:id/threads` | `threadType`(req), `bodyHtml?`, `bodyText?`, `createdByUserId?`, `createdByCustomerId?`, `isDraft?`, `toAddresses?`, `ccAddresses?` | `HelpdeskThread` |
| `GET` | `/api/helpdesk/mailboxes` | — | `HelpdeskMailbox[]` |
| `POST` | `/api/helpdesk/mailboxes` | `name`(req), `emailAddress`(req), `isActive?` | `HelpdeskMailbox` |
| `GET` | `/api/helpdesk/agents/profile` | — (uses `X-User-Id` header) | `AgentProfile` |
| `PATCH` | `/api/helpdesk/agents/availability` | `isAvailable`(req), `agentStatus?` (uses `X-User-Id` header) | `void` |

```typescript
interface HelpdeskConversation {
  id: string
  tenantId: string
  mailboxId: string
  ticketNumber: number
  subject: string
  customerEmail: string
  customerId: string | null
  assigneeUserId: string | null
  status: 'OPEN' | 'PENDING' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  sourceChannel: string
  previewText: string | null
  hasAttachments: boolean
  lastReplyAt: string | null
  lastReplyFrom: string | null
  closedAt: string | null
  estimatedHours: string | null
  workedHours: string | null
  dueDate: string | null
  firstResponseAt: string | null
  resolvedAt: string | null
  isInternal: boolean
  requiresApproval: boolean
  createdAt: string
  updatedAt: string
}

interface HelpdeskThread {
  id: string
  tenantId: string
  conversationId: string
  threadType: string
  bodyHtml: string | null
  bodyText: string | null
  createdByUserId: string | null
  createdByCustomerId: string | null
  isDraft: boolean
  messageIdHeader: string | null
  toAddresses: string | null
  ccAddresses: string | null
  createdAt: string
  updatedAt: string
}

interface HelpdeskMailbox {
  id: string
  tenantId: string
  name: string
  emailAddress: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AgentProfile {
  id: string
  tenantId: string
  userId: string
  isAvailable: boolean
  agentStatus: string
  activeTicketsCount: number
  resolvedTicketsCount: number
  createdAt: string
  updatedAt: string
}
```

### 2.10 Affiliates — `api/affiliates`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/affiliates/programs` | `isActive?`, `cursor?`, `limit?` | `PaginatedResult<AffiliateProgram>` |
| `POST` | `/api/affiliates/programs` | `name`(req), `commissionType`(req), `commissionValue`(req), `cookieDurationDays?`, `isMultiLevel?`, `maxMlmLevels?`, `isActive?` | `AffiliateProgram` |
| `GET` | `/api/affiliates/programs/:id` | — | `AffiliateProgram` |
| `PUT` | `/api/affiliates/programs/:id` | Partial | `void` |
| `POST` | `/api/affiliates/register` | `programId`(req), `customerId`(req), `referralCode`(req), `referralLink`(req), `parentAffiliateId?`, `mlmLevel?`, `status?` | `Affiliate` |
| `GET` | `/api/affiliates` | `programId?`, `status?`, `cursor?`, `limit?` | `PaginatedResult<Affiliate>` |
| `GET` | `/api/affiliates/:id` | — | `Affiliate` |
| `POST` | `/api/affiliates/:id/commissions` | `sourceOrderId`(req), `commissionAmount`(req), `mlmLevelEarned?`, `status?` | `AffiliateCommission` |
| `GET` | `/api/affiliates/:id/commissions` | `status?`, `cursor?`, `limit?` | `PaginatedResult<AffiliateCommission>` |
| `POST` | `/api/affiliates/:id/payouts` | `amount`(req), `paymentMethod?`, `paymentReference?`, `status?`, `paidAt?` | `AffiliatePayout` |
| `GET` | `/api/affiliates/:id/payouts` | `status?`, `cursor?`, `limit?` | `PaginatedResult<AffiliatePayout>` |

### 2.11 Personal CRM — `api/personal-crm`

All endpoints filtered by `contactId`. Embedded on Contact Detail page.

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/personal-crm/life-events` | `contactId`(req) | `PaginatedResult<LifeEvent>` |
| `POST` | `/api/personal-crm/life-events` | `contactId`(req), `eventType`(req), `name`(req), `description?`, `happenedAt?`, `isYearlyRecurring?` | `LifeEvent` |
| `GET` | `/api/personal-crm/gifts` | `contactId`(req) | `PaginatedResult<Gift>` |
| `POST` | `/api/personal-crm/gifts` | `contactId`(req), `direction`(req), `name`(req), `description?`, `url?`, `estimatedValue?`, `status?`, `dateGivenOrReceived?` | `Gift` |
| `GET` | `/api/personal-crm/debts` | `contactId`(req) | `PaginatedResult<Debt>` |
| `POST` | `/api/personal-crm/debts` | `contactId`(req), `direction`(req), `amount`(req), `reason`(req), `status?`, `dueDate?` | `Debt` |
| `POST` | `/api/personal-crm/debts/:id/settle` | — | `void` |
| `GET` | `/api/personal-crm/reminders` | `contactId`(req) | `PaginatedResult<Reminder>` |
| `POST` | `/api/personal-crm/reminders` | `contactId`(req), `title`(req), `description?`, `frequencyType?`, `frequencyInterval?`, `nextDueDate?`, `isActive?` | `Reminder` |
| `POST` | `/api/personal-crm/reminders/:id/toggle` | — | `void` |
| `GET` | `/api/personal-crm/pets` | `contactId`(req) | `PaginatedResult<Pet>` |
| `POST` | `/api/personal-crm/pets` | `contactId`(req), `petCategory`(req), `name`(req), `breed?` | `Pet` |

```typescript
interface LifeEvent { id: string; tenantId: string; contactId: string; eventType: string; name: string; description: string | null; happenedAt: string | null; isYearlyRecurring: boolean; createdAt: string; updatedAt: string }
interface Gift { id: string; tenantId: string; contactId: string; direction: 'GIVEN' | 'RECEIVED'; name: string; description: string | null; url: string | null; estimatedValue: string | null; status: 'IDEA' | 'PURCHASED' | 'GIVEN' | 'RECEIVED'; dateGivenOrReceived: string | null; createdAt: string; updatedAt: string }
interface Debt { id: string; tenantId: string; contactId: string; direction: 'OWES_ME' | 'I_OWE'; amount: string; reason: string; status: 'UNPAID' | 'PAID' | 'FORGIVEN'; dueDate: string | null; createdAt: string; updatedAt: string }
interface Reminder { id: string; tenantId: string; contactId: string; title: string; description: string | null; frequencyType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'; frequencyInterval: number | null; nextDueDate: string | null; isActive: boolean; createdAt: string; updatedAt: string }
interface Pet { id: string; tenantId: string; contactId: string; petCategory: string; name: string; breed: string | null; createdAt: string }
```

### 2.12 Loyalty — `api/loyalty`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/loyalty/profile/:contactId` | — | `LoyaltyProfile` |
| `POST` | `/api/loyalty/earn` | `contactId`(req), `points`(req) | `LoyaltyProfile` |
| `POST` | `/api/loyalty/redeem` | `contactId`(req), `points`(req) | `LoyaltyProfile` |
| `GET` | `/api/loyalty/segments` | — | `CustomerSegment[]` |
| `POST` | `/api/loyalty/segments` | `name`(req), `description?`, `isDynamic?`, `rulesJson?` | `CustomerSegment` |
| `POST` | `/api/loyalty/segments/:id/assign` | `contactId`(req) | `void` |
| `GET` | `/api/loyalty/metrics/:contactId` | — | `CustomerMetrics` |

```typescript
interface LoyaltyProfile {
  id: string
  tenantId: string
  contactId: string
  loyaltyPointsBalance: number
  tierLevel: string
  totalLifetimeValue: string
  totalPurchasesCount: number
  averageOrderValue: string
  lastPurchaseDate: string | null
  createdAt: string
  updatedAt: string
}

interface CustomerSegment { id: string; tenantId: string; name: string; description: string | null; isDynamic: boolean; rulesJson: unknown; createdAt: string; updatedAt: string }
interface CustomerMetrics { id: string; tenantId: string; contactId: string; churnRiskScore: string | null; rfmScore: string | null; npsScore: number | null; customerSatisfactionScore: string | null; calculatedAt: string }
```

### 2.13 Tags — `api/tags`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/tags` | `search?` | `{ data: Tag[] }` |
| `POST` | `/api/tags` | `name`(req), `color?`(default `#E2E8F0`) | `Tag` |
| `GET` | `/api/tags/:id` | — | `Tag` |
| `PUT` | `/api/tags/:id` | `name?`, `color?` | `Tag` |
| `DELETE` | `/api/tags/:id` | — | `void` |

```typescript
interface Tag {
  id: string
  tenantId: string
  name: string
  color: string // default '#E2E8F0'
  createdAt: string
}
```

---

## 3. Page Components Map

### 3.1 Common/Shared Components

| Component | Props | Used In |
|---|---|---|
| `DataTable<T>` | `columns: ColumnDef<T>[]`, `data: T[]`, `nextCursor: string \| null`, `onLoadMore: () => void`, `loading: boolean`, `emptyMessage?: string` | All list pages |
| `SearchInput` | `value: string`, `onChange: (v: string) => void`, `placeholder?: string` | All list pages (companies, contacts, etc.) |
| `FilterBar` | `filters: FilterDef[]`, `values: Record<string, string>`, `onChange: (key, value) => void` | Contacts (leadStatus), Tickets (status, priority), Deals (pipeline), Campaigns (status) |
| `EntityCard` | `title: string`, `subtitle?: string`, `actions?: ReactNode`, `children: ReactNode` | Detail pages, contact/company cards |
| `Modal` | `open: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode`, `size?: 'sm' \| 'md' \| 'lg' \| 'xl'` | Create/Edit forms (as overlays) |
| `FormField` | `label: string`, `error?: string`, `required?: boolean`, `children: ReactNode` | All forms |
| `StatusBadge` | `status: string`, `variant?: 'default' \| 'success' \| 'warning' \| 'danger'` | Status display everywhere |
| `Avatar` | `src?: string`, `name: string`, `size?: 'sm' \| 'md' \| 'lg'` | Contacts, users |
| `EmptyState` | `icon?: ReactNode`, `title: string`, `description?: string`, `action?: { label: string, onClick: () => void }` | Empty lists |
| `Skeleton` | `variant: 'text' \| 'card' \| 'table-row'`, `count?: number` | Loading states |
| `ConfirmDialog` | `open: boolean`, `title: string`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`, `variant?: 'danger'` | Delete confirmations |
| `Pagination` | `nextCursor: string \| null`, `loading: boolean`, `onLoadMore: () => void` | Bottom of cursor-based lists |
| `KanbanBoard` | `stages: StageWithDeals[]`, `onDragEnd: (dealId, newStageId) => void`, `onDealClick: (dealId) => void` | Pipeline board |
| `ActivityTimeline` | `items: TimelineItem[]`, `onLoadMore?: () => void`, `loading?: boolean` | Contact/Company/Deal detail (combines notes, tasks, calls) |
| `Tabs` | `tabs: { id: string, label: string, count?: number }[]`, `activeTab: string`, `onChange: (id) => void` | Detail pages (contact, company, deal) |
| `ColorPicker` | `value: string`, `onChange: (color: string) => void` | Tag creation, settings |
| `KanbanCard` | `deal: Deal`, `onClick: () => void` | Deal card inside Kanban columns |

### 3.2 Page-Specific Components

#### Dashboard (`/`)

```
┌─────────────────────────────────────────────┐
│  DashboardLayout                             │
│  ├── StatsCard[] (total companies, contacts,  │
│  │   active deals, open tickets)             │
│  ├── RecentActivity (latest notes, tasks,     │
│  │   calls across all entities)              │
│  ├── PipelineSummary (deal amounts by stage)  │
│  └── UpcomingTasks (current user's tasks)     │
└─────────────────────────────────────────────┘
```

Data sources: `GET /api/tasks?assignedUserId=me&isCompleted=false&limit=5`, `GET /api/notes?limit=5`, `GET /api/companies?limit=5`, `GET /api/contacts?limit=5`

#### Company List (`/companies`)

```
┌─────────────────────────────────────────────┐
│  SearchInput (by name)                      │
│  FilterBar (by industry)                    │
│  DataTable<Company>                         │
│  ├── columns: name, industry, employees,    │
│  │   revenue, createdAt                     │
│  ├── row click → /companies/[id]            │
│  └── Pagination (cursor-based)              │
│  CreateCompanyButton → Modal(CreateCompanyForm)│
└─────────────────────────────────────────────┘
```

#### Company Detail (`/companies/[id]`)

```
┌─────────────────────────────────────────────┐
│  EntityCard (company info, edit/delete btn) │
│  Tabs:                                      │
│  ├── Contacts (DataTable, filtered by       │
│  │   companyId)                             │
│  ├── Deals (DataTable, filtered by          │
│  │   companyId)                             │
│  ├── Contracts (DataTable, filtered by      │
│  │   companyId)                             │
│  └── Notes (ActivityTimeline, filtered by   │
│      companyId)                             │
└─────────────────────────────────────────────┘
```

#### Contact List (`/contacts`)

```
┌─────────────────────────────────────────────┐
│  SearchInput (by name/email)                │
│  FilterBar (leadStatus, isStarred toggle)   │
│  DataTable<Contact>                         │
│  ├── columns: name, email, phone, company,  │
│  │   leadStatus, isStarred (toggle star)    │
│  ├── row click → /contacts/[id]             │
│  └── Pagination                             │
│  CreateContactButton → Modal(CreateForm)    │
└─────────────────────────────────────────────┘
```

#### Contact Detail (`/contacts/[id]`)

```
┌─────────────────────────────────────────────┐
│  EntityCard (contact info, edit/delete btn) │
│  ├── Avatar + name, email, phone, address   │
│  ├── Lead status badge, starred toggle      │
│  └── Company link, loyalty points, tier     │
│  Tabs:                                      │
│  ├── Overview                               │
│  │   ├── ActivityTimeline (notes+tasks+     │
│  │   │   calls for this contact)            │
│  │   └── Quick actions: add note, task,call │
│  ├── Personal CRM                           │
│  │   ├── LifeEvents timeline                │
│  │   │   └── Modal(CreateLifeEventForm)     │
│  │   ├── Gifts list                         │
│  │   │   └── Modal(CreateGiftForm)          │
│  │   ├── Debts list + settle action         │
│  │   │   └── Modal(CreateDebtForm)          │
│  │   ├── Reminders list + toggle            │
│  │   │   └── Modal(CreateReminderForm)      │
│  │   └── Pets list                          │
│  │       └── Modal(AddPetForm)              │
│  ├── Loyalty                                │
│  │   ├── Profile card (points, tier, LTV)   │
│  │   ├── Earn/Redeem points action          │
│  │   └── Metrics (churn risk, NPS, RFM)     │
│  └── Tags                                   │
│      └── TagSelector (multi-select tags)    │
└─────────────────────────────────────────────┘
```

#### Pipeline Board (`/pipelines/[id]/board`)

```
┌─────────────────────────────────────────────┐
│  Pipeline title + edit/delete buttons       │
│  KanbanBoard                                │
│  ├── KanbanColumn (per stage)               │
│  │   ├── Stage header (name, probability)   │
│  │   ├── Deal count badge                   │
│  │   └── KanbanCard[] (draggable)           │
│  │       ├── Deal name                      │
│  │       ├── Amount                         │
│  │       ├── Contact/company name           │
│  │       └── Expected close date            │
│  └── AddStage button (if last column)       │
│  FloatingActionButton → Modal(CreateDealForm)│
└─────────────────────────────────────────────┘
```

#### Ticket Detail (`/support/tickets/[id]`)

```
┌─────────────────────────────────────────────┐
│  Ticket header (subject, status badge,      │
│  priority badge)                            │
│  Ticket body (description)                  │
│  Action buttons: change status, assign      │
│  Replies section                            │
│  ├── ReplyThread[] (Agent messages,         │
│  │   Customer messages, system notes)       │
│  │   └── Internal note toggle               │
│  └── ReplyForm (message input)              │
└─────────────────────────────────────────────┘
```

#### Helpdesk Conversation (`/helpdesk/conversations/[id]`)

```
┌─────────────────────────────────────────────┐
│  Conversation header (subject, status,       │
│  mailbox, assignee)                         │
│  ThreadTimeline                             │
│  ├── ThreadCard[]                           │
│  │   ├── Thread type badge                  │
│  │   ├── From/To addresses                  │
│  │   ├── Body (rendered HTML or text)       │
│  │   └── Attachments list                   │
│  └── AddThreadForm                          │
│      ├── Thread type selector               │
│      ├── Rich text editor (bodyHtml)        │
│      ├── To/CC fields (if reply)            │
│      └── Draft toggle                       │
│  Side panel:                                │
│  ├── Customer info                          │
│  ├── Status changer                         │
│  ├── Assignee selector                      │
│  └── Estimated/worked hours                 │
└─────────────────────────────────────────────┘
```

#### Contract/Quote Detail (`/contracts/[id]`, `/quotes/[id]`)

```
┌─────────────────────────────────────────────┐
│  EntityCard (contract info, status badge)   │
│  Key fields: company, start/end dates, MRR, │
│  auto-renew toggle                          │
│  Action buttons:                            │
│  ├── Renew (POST /api/contracts/:id/renew)  │
│  ├── Change status (PATCH status)           │
│  └── Edit (Modal with form)                 │
│  Related deals link                         │
└─────────────────────────────────────────────┘

(Quote similar: send/accept/reject actions,
  quoteNumber, validUntil, subtotal/tax/total)
```

#### Affiliate Detail (`/affiliates/[id]`)

```
┌─────────────────────────────────────────────┐
│  EntityCard (affiliate info, status badge)  │
│  ├── Referral code, link, program name      │
│  ├── Total earnings, MLM level              │
│  └── Parent affiliate link                  │
│  Tabs:                                      │
│  ├── Commissions                            │
│  │   ├── DataTable (amount, source_order,   │
│  │   │   status, date)                      │
│  │   └── RecordCommission → Modal(CreateForm)│
│  └── Payouts                                │
│      ├── DataTable (amount, method, status, │
│      │   date)                              │
│      └── ProcessPayout → Modal(CreateForm)  │
└─────────────────────────────────────────────┘
```

#### Settings / Tags (`/settings/tags`)

```
┌─────────────────────────────────────────────┐
│  Header: Tags management                    │
│  TagList                                    │
│  ├── TagRow[]                               │
│  │   ├── ColorCircle (ColorPicker)          │
│  │   ├── Tag name (editable inline)         │
│  │   └── Delete button (ConfirmDialog)      │
│  └── AddTagForm (name + color picker)       │
└─────────────────────────────────────────────┘
```

---

## 4. Data Fetching Patterns

### 4.1 API Client

```typescript
// src/infrastructure/crm/api/api-client.ts
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3006/api'

  async fetch<T>(path: string, options?: RequestInit & {
    params?: Record<string, string | undefined>
    tenantId: string
    token: string
  }): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, v)
      })
    }

    const res = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options?.token}`,
        'X-Tenant-Id': options?.tenantId || '',
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new ApiError(res.status, error.message || 'Unknown error')
    }

    return res.status === 204 ? undefined as T : res.json()
  }

  get<T>(path: string, params?: Record<string, string | undefined>, ctx: RequestContext) { return this.fetch<T>(path, { method: 'GET', params, ...ctx }) }
  post<T>(path: string, body: unknown, ctx: RequestContext) { return this.fetch<T>(path, { method: 'POST', body: JSON.stringify(body), ...ctx }) }
  put<T>(path: string, body: unknown, ctx: RequestContext) { return this.fetch<T>(path, { method: 'PUT', body: JSON.stringify(body), ...ctx }) }
  patch<T>(path: string, body: unknown, ctx: RequestContext) { return this.fetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...ctx }) }
  delete<T>(path: string, ctx: RequestContext) { return this.fetch<T>(path, { method: 'DELETE', ...ctx }) }
}

// Paginated wrapper helper
async function fetchPaginated<T>(
  api: ApiClient,
  path: string,
  params: Record<string, string | undefined>,
  ctx: RequestContext
): Promise<{ data: T[], nextCursor: string | null }> {
  return api.get<{ data: T[], nextCursor: string | null }>(path, params, ctx)
}
```

### 4.2 React Query Hooks (TanStack Query)

```typescript
// Pattern for each module — example for companies:

// Query key factory
const companyKeys = {
  all: ['companies'] as const,
  list: (filters: CompanyFilters) => [...companyKeys.all, 'list', filters] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
}

// Hook for list
function useCompanies(filters: CompanyFilters, ctx: RequestContext) {
  return useInfiniteQuery({
    queryKey: companyKeys.list(filters),
    queryFn: ({ pageParam }) => apiClient.fetchPaginated<Company>(
      '/companies', { ...filters, cursor: pageParam }, ctx
    ),
    getNextPageParam: (last) => last.nextCursor,
    initialPageParam: undefined as string | undefined,
  })
}

// Hook for single entity
function useCompany(id: string, ctx: RequestContext) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => apiClient.get<Company>(`/companies/${id}`, {}, ctx),
  })
}

// Mutation
function useCreateCompany(ctx: RequestContext) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompany) => apiClient.post<Company>('/companies', data, ctx),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.all }),
  })
}
```

### 4.3 Server vs Client Components

```
┌─────────────────────────────────────┐
│  Server Component (default)          │
│  ├── Layout (sidebar, header, auth)  │
│  ├── Shell/Page skeleton             │
│  └── SEO metadata                    │
│                                     │
│  Client Components (only where       │
│  interactivity is needed)           │
│  ├── DataTable (pagination, sort)    │
│  ├── KanbanBoard (drag & drop)       │
│  ├── Forms (React Hook Form + Zod)  │
│  ├── SearchInput, FilterBar          │
│  ├── Modal, ConfirmDialog            │
│  ├── StatusBadge, Avatar             │
│  └── ActivityTimeline, Tabs          │
└─────────────────────────────────────┘
```

---

## 5. Entity Relationship Diagram (Frontend Data)

```
Company
  ├── Contacts (companyId FK)
  ├── Deals (companyId FK)
  ├── Contracts (companyId FK)
  └── Notes (companyId FK)

Contact
  ├── Notes (contactId FK)
  ├── Tasks (contactId FK)
  ├── Calls (contactId FK)
  ├── LifeEvents (contactId FK)
  ├── Gifts (contactId FK)
  ├── Debts (contactId FK)
  ├── Reminders (contactId FK)
  ├── Pets (contactId FK)
  ├── LoyaltyProfile (contactId unique)
  ├── CustomerMetrics (contactId unique)
  └── Tags (via contact_tags junction)

Pipeline
  └── Stages
       └── Deals (stageId FK)

Deal
  ├── Notes (dealId FK)
  ├── Quotes (dealId FK)
  └── LineItems

Campaign
  └── Members (contacts)

Ticket
  ├── Replies
  └── Contact (customer)

HelpdeskConversation
  ├── Threads
  ├── Mailbox
  └── Customer (email)

SalesTeam
  ├── Members (users)
  └── Quotas (users)

AffiliateProgram
  └── Affiliates
       ├── Commissions
       └── Payouts
```

---

## 6. Form Validation Schemas (Zod — import from `@crm/contracts`)

Each BFF module validates with Zod schemas from `packages/contracts/src/`. The frontend should use the same schemas:

```typescript
// Example usage:
import { CreateCompanySchema, CreateContactSchema, CreateDealSchema } from '@crm/contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

function CreateCompanyForm() {
  const form = useForm({
    resolver: zodResolver(CreateCompanySchema),
  })
  // ...
}
```

Available Zod schemas per module:

| Module | Create Schema | Filters Schema | Entity Schema |
|---|---|---|---|
| Companies | `CreateCompanySchema` | `CompanyFilterSchema` | `CompanySchema` |
| Contacts | `CreateContactSchema` | `ContactFilterSchema` | `ContactSchema` |
| Pipelines | `CreatePipelineSchema` | — | `PipelineSchema` |
| Stages | `CreateStageSchema` | — | `PipelineStageSchema` |
| Deals | `CreateDealSchema`, `MoveDealSchema`, `WinDealSchema`, `LoseDealSchema` | `DealFilterSchema` | `DealSchema` |
| Notes | `CreateNoteSchema` | — | `NoteSchema` |
| Tasks | `CreateTaskSchema` | — | `TaskSchema` |
| Calls | `CreateCallSchema` | — | `CallSchema` |
| Tickets | `CreateTicketSchema` | — | `SupportTicketSchema` |
| Ticket Replies | `CreateReplySchema` | — | `TicketReplySchema` |
| Campaigns | `CreateCampaignSchema` | — | `CampaignSchema` |
| Campaign Members | `AddCampaignMemberSchema` | — | `CampaignMemberSchema` |
| Quotes | `CreateQuoteSchema` | — | `QuoteSchema` |
| Contracts | `CreateContractSchema` | — | `ContractSchema` |
| Sales Teams | `CreateSalesTeamSchema` | — | `SalesTeamSchema` |
| Sales Quotas | `CreateQuotaSchema` | — | `SalesQuotaSchema` |
| Helpdesk Conversations | `CreateConversationSchema` | `ConversationFilterSchema` | `HelpdeskConversationSchema` |
| Helpdesk Threads | `AddThreadSchema` | — | `HelpdeskThreadSchema` |
| Helpdesk Mailboxes | `CreateMailboxSchema` | — | `HelpdeskMailboxSchema` |
| Affiliate Programs | `CreateProgramSchema` | — | `AffiliateProgramSchema` |
| Affiliates | `RegisterAffiliateSchema` | — | `AffiliateSchema` |
| Affiliate Commissions | `RecordCommissionSchema` | — | `AffiliateCommissionSchema` |
| Affiliate Payouts | `ProcessPayoutSchema` | — | `AffiliatePayoutSchema` |
| Life Events | `CreateLifeEventSchema` | — | `LifeEventSchema` |
| Gifts | `CreateGiftSchema` | — | `GiftSchema` |
| Debts | `CreateDebtSchema` | — | `DebtSchema` |
| Reminders | `CreateReminderSchema` | — | `ReminderSchema` |
| Pets | `AddPetSchema` | — | `PetSchema` |
| Loyalty Segments | `CreateSegmentSchema` | — | `CustomerSegmentSchema` |
| Tags | `CreateTagSchema` | — | `TagSchema` |
| Pagination | — | `CursorParams` | `PaginatedResponse<T>` |

---

## 7. Auth & Context

```typescript
// Context available through React context or server-side cookies:
interface RequestContext {
  token: string      // JWT from auth service (apps/auth)
  tenantId: string   // Current tenant UUID
  userId: string     // Current user UUID (used for helpdesk agent operations)
}

// Middleware/Interceptor pattern:
// 1. Extract JWT from cookie/header
// 2. Decode JWT to get tenantId + userId claims
// 3. Forward to BFF as headers on every request
// 4. Handle 401 → redirect to login
// 5. Handle 403 → show permission denied
```

---

## 8. Pagination Implementation Pattern

```typescript
// ALL list endpoints use cursor-based pagination.
// The frontend pattern:

// Infinite scroll (preferred for tables)
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['entity', filters],
  queryFn: ({ pageParam }) => api.getPaginated(path, { ...filters, cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: undefined as string | undefined,
})

// Flatten pages for DataTable
const items = data?.pages.flatMap(p => p.data) ?? []
```

---

## 9. Status Options (for Select/Filter dropdowns)

| Field | Values |
|---|---|
| **Contact.leadStatus** | `NEW`, `CONTACTED`, `QUALIFIED`, `CUSTOMER`, `CHURNED` |
| **Deal.status** | `OPEN`, `WON`, `LOST` |
| **Ticket.status** | `OPEN`, `PENDING`, `RESOLVED`, `CLOSED` |
| **Campaign.status** | `PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| **CampaignMember.status** | `SENT`, `OPENED`, `CLICKED`, `RESPONDED`, `BOUNCED`, `UNSUBSCRIBED` |
| **Quote.status** | `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED` |
| **Contract.status** | `DRAFT`, `ACTIVE`, `EXPIRED`, `CANCELLED`, `RENEWED` |
| **HelpdeskConversation.status** | `OPEN`, `PENDING`, `WAITING_CUSTOMER`, `RESOLVED`, `CLOSED` |
| **HelpdeskConversation.priority** | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| **Affiliate.status** | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| **AffiliateProgram.commissionType** | `PERCENTAGE`, `FIXED` |
| **AffiliateCommission.status** | `PENDING`, `APPROVED`, `PAID`, `CANCELLED` |
| **AffiliatePayout.status** | `PENDING`, `PROCESSED`, `FAILED`, `CANCELLED` |
| **Gift.direction** | `GIVEN`, `RECEIVED` |
| **Gift.status** | `IDEA`, `PURCHASED`, `GIVEN`, `RECEIVED` |
| **Debt.direction** | `OWES_ME`, `I_OWE` |
| **Debt.status** | `UNPAID`, `PAID`, `FORGIVEN` |
| **Reminder.frequencyType** | `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, `CUSTOM` |
| **Call.callType** | `INBOUND`, `OUTBOUND`, `MEETING` |
| **TicketReply.authorType** | `CUSTOMER`, `AGENT`, `SYSTEM` |
| **Loyalty tier levels** | `BRONZE`, `SILVER`, `GOLD`, `PLATINUM` |

---

---

## 10. DDD + Clean Architecture — File Structure

### Architectural Layers

```
┌──────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                      │
│  Next.js App Router + React Components + Tailwind         │
│  Responsabilidad: Renderizar UI, capturar eventos         │
│  Dependency: Application Layer (use cases, stores)        │
├──────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                        │
│  TanStack Query + Zustand + use cases                     │
│  Responsabilidad: Orquestar flujos, estado global         │
│  Dependency: Domain Layer (interfaces, entities)          │
├──────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                     │
│  ApiClient, Repository Impls, Auth, Storage               │
│  Responsabilidad: Comunicación con BFF, persistencia      │
│  Dependency: Domain Layer (repository interfaces)         │
├──────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                          │
│  Entities, Value Objects, Repository Interfaces           │
│  Responsabilidad: Reglas de negocio, tipos puros          │
│  Dependency: NONE (zero framework dependency)             │
└──────────────────────────────────────────────────────────┘
```

### Dependency Rule

- **Domain** no depende de nada externo (sin React, sin Next.js, sin TanStack Query).
- **Application** depende de Domain (importa interfaces y tipos, nunca implementaciones concretas de infraestructura).
- **Infrastructure** implementa las interfaces definidas en Domain.
- **Presentation** depende solo de Application y del contenedor de DI.

### Complete Directory Structure

```
src/
│
├── domain/                                    # DOMAIN LAYER
│   ├── crm/                                   # CRM Bounded Context (raíz)
│   │   ├── companies/
│   │   │   ├── company.entity.ts                  # Entity con factory method
│   │   │   ├── company.repository.ts              # Interfaz abstracta del repositorio
│   │   │   └── value-objects/
│   │   │       ├── TaxId.ts                       # Value Object (formato + validación)
│   │   │       └── AnnualRevenue.ts               # Value Object (Money)
│   │   ├── contacts/
│   │   │   ├── contact.entity.ts
│   │   │   ├── contact.repository.ts
│   │   │   └── value-objects/
│   │   │       ├── Email.ts
│   │   │       ├── Phone.ts
│   │   │       ├── LeadStatus.ts                  # Enum tipado
│   │   │       └── Address.ts
│   │   ├── deals/
│   │   │   ├── deal.entity.ts
│   │   │   ├── deal.repository.ts
│   │   │   └── value-objects/
│   │   │       ├── Money.ts
│   │   │       ├── DealStatus.ts
│   │   │       └── ExpectedCloseDate.ts
│   │   ├── pipelines/
│   │   │   ├── pipeline.entity.ts
│   │   │   ├── pipeline.repository.ts
│   │   │   ├── stage.entity.ts
│   │   │   └── stage.repository.ts
│   │   ├── notes/
│   │   │   ├── note.entity.ts
│   │   │   └── note.repository.ts
│   │   ├── tasks/
│   │   │   ├── task.entity.ts
│   │   │   └── task.repository.ts
│   │   ├── calls/
│   │   │   ├── call.entity.ts
│   │   │   └── call.repository.ts
│   │   ├── support-tickets/
│   │   │   ├── ticket.entity.ts
│   │   │   ├── ticket.repository.ts
│   │   │   ├── ticket-reply.entity.ts
│   │   │   └── ticket-reply.repository.ts
│   │   ├── campaigns/
│   │   │   ├── campaign.entity.ts
│   │   │   ├── campaign.repository.ts
│   │   │   ├── campaign-member.entity.ts
│   │   │   └── campaign-member.repository.ts
│   │   ├── contracts/
│   │   │   ├── contract.entity.ts
│   │   │   ├── contract.repository.ts
│   │   │   ├── quote.entity.ts
│   │   │   └── quote.repository.ts
│   │   ├── sales-teams/
│   │   │   ├── sales-team.entity.ts
│   │   │   ├── sales-team.repository.ts
│   │   │   ├── sales-quota.entity.ts
│   │   │   └── sales-quota.repository.ts
│   │   ├── helpdesk/
│   │   │   ├── conversation.entity.ts
│   │   │   ├── conversation.repository.ts
│   │   │   ├── thread.entity.ts
│   │   │   ├── thread.repository.ts
│   │   │   ├── mailbox.entity.ts
│   │   │   ├── mailbox.repository.ts
│   │   │   ├── agent-profile.entity.ts
│   │   │   └── agent-profile.repository.ts
│   │   ├── affiliates/
│   │   │   ├── affiliate-program.entity.ts
│   │   │   ├── affiliate-program.repository.ts
│   │   │   ├── affiliate.entity.ts
│   │   │   ├── affiliate.repository.ts
│   │   │   ├── commission.entity.ts
│   │   │   ├── commission.repository.ts
│   │   │   ├── payout.entity.ts
│   │   │   └── payout.repository.ts
│   │   ├── personal-crm/
│   │   │   ├── life-event.entity.ts
│   │   │   ├── life-event.repository.ts
│   │   │   ├── gift.entity.ts
│   │   │   ├── gift.repository.ts
│   │   │   ├── debt.entity.ts
│   │   │   ├── debt.repository.ts
│   │   │   ├── reminder.entity.ts
│   │   │   ├── reminder.repository.ts
│   │   │   ├── pet.entity.ts
│   │   │   └── pet.repository.ts
│   │   ├── loyalty/
│   │   │   ├── loyalty-profile.entity.ts
│   │   │   ├── loyalty-profile.repository.ts
│   │   │   ├── customer-segment.entity.ts
│   │   │   └── customer-segment.repository.ts
│   │   ├── tags/
│   │   │   ├── tag.entity.ts
│   │   │   └── tag.repository.ts
│   │   └── common/
│   │       ├── entities/
│   │       │   └── base.entity.ts                 # Entity base (id, createdAt, updatedAt, equality)
│   │       ├── value-objects/
│   │       │   ├── TenantId.ts
│   │       │   ├── UserId.ts
│   │       │   └── Pagination.ts                  # Cursor + Limit VO
│   │       ├── repositories/
│   │       │   └── repository.interface.ts        # Generic Repository<T> interface
│   │       └── results/
│   │           ├── result.ts                      # Result<T, E> monad (Success/Failure)
│   │           └── paginated-result.ts            # PaginatedResult<T>
│   └── erp/                                       # (futuro) ERP Bounded Context
│
├── application/                                   # APPLICATION LAYER
│   ├── crm/                                       # CRM Application Layer
│   │   ├── companies/
│   │   │   ├── use-cases/
│   │   │   │   ├── create-company.use-case.ts     # Orquesta CreateCompany → Repository.save()
│   │   │   │   ├── update-company.use-case.ts
│   │   │   │   ├── delete-company.use-case.ts
│   │   │   │   ├── get-company.use-case.ts
│   │   │   │   └── list-companies.use-case.ts
│   │   │   └── queries/
│   │   │       └── company-filters.ts             # Read model filters
│   │   ├── contacts/
│   │   │   ├── use-cases/
│   │   │   │   ├── create-contact.use-case.ts
│   │   │   │   ├── update-contact.use-case.ts
│   │   │   │   ├── delete-contact.use-case.ts
│   │   │   │   ├── get-contact.use-case.ts
│   │   │   │   └── list-contacts.use-case.ts
│   │   │   └── queries/
│   │   │       └── contact-filters.ts
│   │   ├── deals/
│   │   │   ├── use-cases/
│   │   │   │   ├── create-deal.use-case.ts
│   │   │   │   ├── update-deal.use-case.ts
│   │   │   │   ├── move-deal.use-case.ts
│   │   │   │   ├── win-deal.use-case.ts
│   │   │   │   ├── lose-deal.use-case.ts
│   │   │   │   ├── delete-deal.use-case.ts
│   │   │   │   ├── get-deal.use-case.ts
│   │   │   │   └── list-deals.use-case.ts
│   │   │   └── queries/
│   │   │       └── deal-filters.ts
│   │   ├── pipelines/
│   │   │   ├── use-cases/
│   │   │   │   ├── create-pipeline.use-case.ts
│   │   │   │   ├── get-pipeline-board.use-case.ts
│   │   │   │   ├── update-pipeline.use-case.ts
│   │   │   │   ├── delete-pipeline.use-case.ts
│   │   │   │   ├── create-stage.use-case.ts
│   │   │   │   └── reorder-stages.use-case.ts
│   │   │   └── queries/
│   │   │       └── pipeline-board-query.ts
│   │   ├── notes/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── tasks/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── calls/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── support-tickets/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── campaigns/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── contracts/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── sales-teams/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── helpdesk/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── affiliates/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── personal-crm/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── loyalty/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── tags/
│   │   │   ├── use-cases/
│   │   │   └── queries/
│   │   ├── stores/                               # Zustand global stores
│   │   │   ├── auth.store.ts
│   │   │   ├── tenant.store.ts
│   │   │   ├── ui.store.ts                       # Sidebar state, theme, modals
│   │   │   └── index.ts
│   │   └── di/                                    # Dependency Injection container
│   │       ├── container.ts                       # Registro de dependencias
│   │       └── tokens.ts                          # DI tokens (symbols)
│   └── erp/                                       # (futuro) ERP Application Layer
│
├── infrastructure/                               # INFRASTRUCTURE LAYER
│   ├── crm/                                       # CRM Infrastructure
│   │   ├── api/
│   │   │   ├── api-client.ts                     # Fetch wrapper (headers, auth, tenant)
│   │   │   ├── api-error.ts                      # ApiError class
│   │   │   └── interceptors/
│   │   │       ├── auth-interceptor.ts           # Attach JWT
│   │   │       └── tenant-interceptor.ts         # Attach X-Tenant-Id
│   │   ├── repositories/                         # Implementaciones de interfaces del domain
│   │   │   ├── companies/
│   │   │   │   └── api-company.repository.ts     # CompanyRepository → ApiClient
│   │   │   ├── contacts/
│   │   │   │   └── api-contact.repository.ts
│   │   │   ├── deals/
│   │   │   │   └── api-deal.repository.ts
│   │   │   ├── pipelines/
│   │   │   │   └── api-pipeline.repository.ts
│   │   │   ├── notes/
│   │   │   │   └── api-note.repository.ts
│   │   │   ├── tasks/
│   │   │   │   └── api-task.repository.ts
│   │   │   ├── calls/
│   │   │   │   └── api-call.repository.ts
│   │   │   ├── tickets/
│   │   │   │   └── api-ticket.repository.ts
│   │   │   ├── campaigns/
│   │   │   │   └── api-campaign.repository.ts
│   │   │   ├── contracts/
│   │   │   │   ├── api-contract.repository.ts
│   │   │   │   └── api-quote.repository.ts
│   │   │   ├── sales-teams/
│   │   │   │   └── api-sales-team.repository.ts
│   │   │   ├── helpdesk/
│   │   │   │   └── api-helpdesk.repository.ts
│   │   │   ├── affiliates/
│   │   │   │   └── api-affiliate.repository.ts
│   │   │   ├── personal-crm/
│   │   │   │   └── api-personal-crm.repository.ts
│   │   │   ├── loyalty/
│   │   │   │   └── api-loyalty.repository.ts
│   │   │   ├── tags/
│   │   │   │   └── api-tag.repository.ts
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── auth-provider.tsx                 # React context + JWT refresh
│   │   │   ├── auth.service.ts                   # Login, logout, refresh token
│   │   │   └── token-store.ts                    # Access/refresh token management
│   │   └── tenant/
│   │       └── tenant-context.tsx                # Tenant provider + resolver
│   └── erp/                                       # (futuro) ERP Infrastructure
│
├── presentation/                                 # PRESENTATION LAYER
│   ├── crm/                                       # CRM Presentation
│   │   ├── app/                                  # Next.js App Router
│   │   │   ├── layout.tsx                        # Root layout (DI container, providers)
│   │   │   ├── page.tsx                          # Dashboard
│   │   │   │   ├── dashboard-stats.tsx           # StatsCard[]
│   │   │   │   ├── recent-activity.tsx           # ActivityTimeline
│   │   │   │   ├── pipeline-summary.tsx          # Deal amounts by stage
│   │   │   │   └── upcoming-tasks.tsx            # Current user's tasks
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx                      # Company list page
│   │   │   │   ├── [id]/page.tsx                 # Company detail page
│   │   │   │   ├── new/page.tsx                  # Create company page
│   │   │   │   └── [id]/edit/page.tsx            # Edit company page
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── pipelines/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/board/page.tsx
│   │   │   │   └── deals/
│   │   │   │       ├── [dealId]/page.tsx
│   │   │   │       └── new/page.tsx
│   │   │   ├── notes/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   ├── calls/page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── contracts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── sales-teams/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── support/
│   │   │   │   ├── tickets/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   └── new/page.tsx
│   │   │   │   └── helpdesk/
│   │   │   │       ├── conversations/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/page.tsx
│   │   │   │       └── settings/
│   │   │   │           ├── mailboxes/page.tsx
│   │   │   │           └── agents/page.tsx
│   │   │   ├── affiliates/
│   │   │   │   ├── programs/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── loyalty/
│   │   │   │   └── segments/page.tsx
│   │   │   └── settings/
│   │   │       ├── tags/page.tsx
│   │   │       └── profile/page.tsx
│   │   │
│   │   ├── components/                           # Shared UI components
│   │   │   ├── ui/                               # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Textarea.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   └── index.ts
│   │   │   ├── common/                           # Shared compound components
│   │   │   │   ├── DataTable.tsx                 # Generic table with pagination
│   │   │   │   ├── SearchInput.tsx               # Debounced search
│   │   │   │   ├── FilterBar.tsx                 # Multi-filter bar
│   │   │   │   ├── EntityCard.tsx                # Entity profile card
│   │   │   │   ├── StatusBadge.tsx               # Color-coded status
│   │   │   │   ├── EmptyState.tsx                # Empty list placeholder
│   │   │   │   ├── ConfirmDialog.tsx             # Delete confirmation
│   │   │   │   ├── Pagination.tsx                # Cursor-based pagination
│   │   │   │   ├── KanbanBoard.tsx               # Drag-and-drop board
│   │   │   │   ├── KanbanCard.tsx                # Deal card in board
│   │   │   │   ├── ActivityTimeline.tsx          # Notes + tasks + calls timeline
│   │   │   │   ├── PageHeader.tsx                # Title + actions
│   │   │   │   ├── LoadingOverlay.tsx
│   │   │   │   └── index.ts
│   │   │   └── modules/                          # Module-specific components
│   │   │       ├── companies/
│   │   │       │   ├── CompanyForm.tsx
│   │   │       │   ├── CompanyInfo.tsx
│   │   │       │   └── CompanyTable.tsx
│   │   │       ├── contacts/
│   │   │       │   ├── ContactForm.tsx
│   │   │       │   ├── ContactInfo.tsx
│   │   │       │   ├── ContactTable.tsx
│   │   │       │   └── PersonalCrmSection.tsx
│   │   │       ├── deals/
│   │   │       │   ├── DealForm.tsx
│   │   │       │   ├── DealCard.tsx
│   │   │       │   ├── DealBoard.tsx
│   │   │       │   └── WinLoseActions.tsx
│   │   │       ├── pipelines/
│   │   │       │   ├── PipelineForm.tsx
│   │   │       │   ├── PipelineCard.tsx
│   │   │       │   └── StageForm.tsx
│   │   │       ├── notes/
│   │   │       │   ├── NoteForm.tsx
│   │   │       │   └── NoteCard.tsx
│   │   │       ├── tasks/
│   │   │       │   ├── TaskForm.tsx
│   │   │       │   └── TaskCard.tsx
│   │   │       ├── calls/
│   │   │       │   ├── CallForm.tsx
│   │   │       │   └── CallCard.tsx
│   │   │       ├── tickets/
│   │   │       │   ├── TicketForm.tsx
│   │   │       │   ├── TicketInfo.tsx
│   │   │       │   ├── TicketTable.tsx
│   │   │       │   └── ReplyThread.tsx
│   │   │       ├── campaigns/
│   │   │       │   ├── CampaignForm.tsx
│   │   │       │   ├── CampaignInfo.tsx
│   │   │       │   └── MemberList.tsx
│   │   │       ├── contracts/
│   │   │       │   ├── ContractForm.tsx
│   │   │       │   └── QuoteActions.tsx
│   │   │       ├── helpdesk/
│   │   │       │   ├── ConversationThread.tsx
│   │   │       │   ├── ConversationForm.tsx
│   │   │       │   ├── MailboxForm.tsx
│   │   │       │   └── AgentAvailability.tsx
│   │   │       ├── affiliates/
│   │   │       │   ├── ProgramForm.tsx
│   │   │       │   ├── AffiliateForm.tsx
│   │   │       │   ├── CommissionForm.tsx
│   │   │       │   └── PayoutForm.tsx
│   │   │       ├── personal-crm/
│   │   │       │   ├── LifeEventForm.tsx
│   │   │       │   ├── GiftForm.tsx
│   │   │       │   ├── DebtForm.tsx
│   │   │       │   ├── ReminderForm.tsx
│   │   │       │   └── PetForm.tsx
│   │   │       └── tags/
│   │   │           ├── TagForm.tsx
│   │   │           ├── TagRow.tsx
│   │   │           └── TagSelector.tsx
│   │   │
│   │   └── hooks/                                # Custom React hooks (connect domain → components)
│   │       ├── use-auth.ts                       # Auth state hook
│   │       ├── use-tenant.ts                     # Tenant context hook
│   │       ├── use-pagination.ts                 # Pagination state management
│   │       ├── use-debounce.ts                   # Debounce utility
│   │       ├── companies/
│   │       │   ├── use-company-list.ts           # TanStack infinite query hook
│   │       │   ├── use-company-detail.ts         # TanStack query hook
│   │       │   ├── use-create-company.ts         # TanStack mutation hook
│   │       │   ├── use-update-company.ts
│   │       │   └── use-delete-company.ts
│   │       ├── contacts/
│   │       │   ├── use-contact-list.ts
│   │       │   ├── use-contact-detail.ts
│   │       │   ├── use-create-contact.ts
│   │       │   ├── use-update-contact.ts
│   │       │   └── use-delete-contact.ts
│   │       ├── deals/
│   │       │   ├── use-deal-list.ts
│   │       │   ├── use-deal-detail.ts
│   │       │   ├── use-create-deal.ts
│   │       │   ├── use-move-deal.ts
│   │       │   ├── use-win-deal.ts
│   │       │   ├── use-lose-deal.ts
│   │       │   ├── use-update-deal.ts
│   │       │   └── use-delete-deal.ts
│   │       ├── pipelines/
│   │       │   ├── use-pipeline-list.ts
│   │       │   ├── use-pipeline-board.ts
│   │       │   ├── use-create-pipeline.ts
│   │       │   ├── use-create-stage.ts
│   │       │   └── use-reorder-stages.ts
│   │       ├── notes/
│   │       │   ├── use-note-list.ts
│   │       │   ├── use-create-note.ts
│   │       │   ├── use-update-note.ts
│   │       │   └── use-delete-note.ts
│   │       ├── tasks/
│   │       │   ├── use-task-list.ts
│   │       │   ├── use-create-task.ts
│   │       │   ├── use-update-task.ts
│   │       │   └── use-delete-task.ts
│   │       ├── calls/
│   │       │   ├── use-call-list.ts
│   │       │   └── use-create-call.ts
│   │       ├── tickets/
│   │       │   ├── use-ticket-list.ts
│   │       │   ├── use-ticket-detail.ts
│   │       │   ├── use-create-ticket.ts
│   │       │   ├── use-update-status.ts
│   │       │   ├── use-assign-ticket.ts
│   │       │   ├── use-create-reply.ts
│   │       │   └── use-ticket-replies.ts
│   │       ├── campaigns/
│   │       │   ├── use-campaign-list.ts
│   │       │   ├── use-campaign-detail.ts
│   │       │   ├── use-create-campaign.ts
│   │       │   ├── use-update-campaign.ts
│   │       │   ├── use-delete-campaign.ts
│   │       │   ├── use-member-list.ts
│   │       │   └── use-add-member.ts
│   │       ├── contracts/
│   │       │   ├── use-contract-list.ts
│   │       │   ├── use-contract-detail.ts
│   │       │   ├── use-create-contract.ts
│   │       │   ├── use-renew-contract.ts
│   │       │   ├── use-update-contract-status.ts
│   │       │   ├── use-quote-list.ts
│   │       │   ├── use-quote-detail.ts
│   │       │   ├── use-send-quote.ts
│   │       │   ├── use-accept-quote.ts
│   │       │   └── use-reject-quote.ts
│   │       ├── sales-teams/
│   │       │   ├── use-team-list.ts
│   │       │   ├── use-team-detail.ts
│   │       │   ├── use-create-team.ts
│   │       │   ├── use-update-team.ts
│   │       │   ├── use-add-member.ts
│   │       │   ├── use-remove-member.ts
│   │       │   ├── use-create-quota.ts
│   │       │   └── use-update-achieved.ts
│   │       ├── helpdesk/
│   │       │   ├── use-conversation-list.ts
│   │       │   ├── use-conversation-detail.ts
│   │       │   ├── use-create-conversation.ts
│   │       │   ├── use-assign-conversation.ts
│   │       │   ├── use-conversation-status.ts
│   │       │   ├── use-resolve-conversation.ts
│   │       │   ├── use-thread-list.ts
│   │       │   ├── use-add-thread.ts
│   │       │   ├── use-mailbox-list.ts
│   │       │   ├── use-create-mailbox.ts
│   │       │   ├── use-agent-profile.ts
│   │       │   └── use-update-availability.ts
│   │       ├── affiliates/
│   │       │   ├── use-program-list.ts
│   │       │   ├── use-program-detail.ts
│   │       │   ├── use-create-program.ts
│   │       │   ├── use-update-program.ts
│   │       │   ├── use-register-affiliate.ts
│   │       │   ├── use-affiliate-list.ts
│   │       │   ├── use-affiliate-detail.ts
│   │       │   ├── use-record-commission.ts
│   │       │   ├── use-commission-list.ts
│   │       │   ├── use-process-payout.ts
│   │       │   └── use-payout-list.ts
│   │       ├── personal-crm/
│   │       │   ├── use-life-events.ts
│   │       │   ├── use-create-life-event.ts
│   │       │   ├── use-gifts.ts
│   │       │   ├── use-create-gift.ts
│   │       │   ├── use-debts.ts
│   │       │   ├── use-create-debt.ts
│   │       │   ├── use-settle-debt.ts
│   │       │   ├── use-reminders.ts
│   │       │   ├── use-create-reminder.ts
│   │       │   ├── use-toggle-reminder.ts
│   │       │   ├── use-pets.ts
│   │       │   └── use-add-pet.ts
│   │       ├── loyalty/
│   │       │   ├── use-loyalty-profile.ts
│   │       │   ├── use-earn-points.ts
│   │       │   ├── use-redeem-points.ts
│   │       │   ├── use-segment-list.ts
│   │       │   ├── use-create-segment.ts
│   │       │   ├── use-assign-to-segment.ts
│   │       │   └── use-customer-metrics.ts
│   │       ├── tags/
│   │       │   ├── use-tag-list.ts
│   │       │   ├── use-create-tag.ts
│   │       │   └── use-delete-tag.ts
│   │       └── index.ts
│   └── erp/                                       # (futuro) ERP Presentation
│
├── shared/                                       # SHARED KERNEL (cross-domain)
│   ├── config/
│   │   └── env.ts                                # NEXT_PUBLIC_* typed env vars
│   ├── constants/
│   │   └── status-enums.ts                       # All status enums (LeadStatus, DealStatus, etc.)
│   ├── utils/
│   │   ├── format-currency.ts
│   │   ├── format-date.ts
│   │   ├── cn.ts                                 # clsx + tailwind-merge
│   │   └── validators.ts                         # Reusable Zod refinements
│   └── types/
│       └── overrides.ts                          # Overrides for @crm/contracts types
│
└── config/
    └── di.ts                                     # DI container setup (top-level wiring)
```

### Why This Architecture

| Principle | How It Applies |
|---|---|
| **Domain layer has zero framework dependencies** | Entities and repository interfaces import nothing from React, Next.js, or TanStack Query. Pure TypeScript classes + interfaces. |
| **Repository interfaces in domain, impls in infrastructure** | `domain/contacts/contact.repository.ts` defines `abstract class ContactRepository { abstract list(...): PaginatedResult<Contact> }`. `infrastructure/repositories/contacts/api-contact.repository.ts` implements it calling `ApiClient`. |
| **Use cases orchestrate, they don't call API directly** | `application/contacts/use-cases/create-contact.use-case.ts` receives a DTO, validates via Zod from domain, calls repository, returns Result. The component never touches the API client. |
| **Dependency Injection** | A lightweight DI container (or React context) wires the abstract repository interface to its concrete implementation. Components receive use cases via DI, never instantiate repositories. |
| **Separation of Command vs Query** | Mutations (create, update, delete, win, lose) are **commands** → invalidate query cache. Reads (list, detail) are **queries** → cached by TanStack Query. They live in separate files. |
| **Module per Bounded Context** | Each domain module (companies, contacts, deals, helpdesk, affiliates, etc.) is isolated. Cross-module communication happens via shared value objects (TenantId, UserId, Money) or application-level orchestrators. |

### Concrete Example: Creating a Contact

```
User clicks "Create Contact" button
  │
  ▼
presentation/crm/app/contacts/new/page.tsx         ← Server Component (layout + metadata)
  │
  ▼
presentation/crm/hooks/contacts/use-create-contact.ts  ← React Hook (TanStack Mutation)
  │
  ▼
application/crm/contacts/use-cases/create-contact.use-case.ts  ← Use case (valida DTO, llama repositorio)
  │
  ▼
domain/crm/contacts/contact.repository.ts               ← Interfaz abstracta
  │
  ▼
infrastructure/crm/repositories/contacts/api-contact.repository.ts  ← Implementación (ApiClient → BFF)
  │
  ▼
ApiClient → POST /api/contacts (X-Tenant-Id, Authorization)
```

---

## 11. Important Notes for AI

1. **All lists are cursor-paginated** — use `useInfiniteQuery` pattern, NOT `useQuery` with page numbers.
2. **All mutations invalidate query cache** by prefix key (e.g., `['companies']`) to refetch list + detail.
3. **Forms should use `@hookform/resolvers/zod`** with schemas from `@crm/contracts` for consistency.
4. **`X-Tenant-Id` header is required on every request** — obtain from JWT claims or tenant context.
5. **Server Components** for layout/page shell; **Client Components** only where interactivity is needed.
6. **No direct API calls from Server Components** — use Client Components with TanStack Query.
7. **Status enums** as dropdown/select filters everywhere applicable.
8. **Delete actions** always need a ConfirmationDialog.
9. **Create/Edit forms** — prefer modal overlays over separate pages for better UX.
10. **Each module** has its own domain entity + repository interface + use cases + hooks + components.
11. **Domain entities NEVER import React, Next.js, or TanStack Query** — pure TypeScript only.
12. **Repository interfaces in domain; implementations in infrastructure** — DI wires them together.
13. **Use cases return `Result<T, E>`** — components handle Success/Failure, never raw API errors.

---

*Generated from BFF API at `apps/bff/src/modules/*/` and contracts at `packages/contracts/src/`.*



