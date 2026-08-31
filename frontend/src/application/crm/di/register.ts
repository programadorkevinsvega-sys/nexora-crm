import { container } from "./container"
import { DI_TOKENS } from "./tokens"

// Repository implementations
import { ApiCompanyRepository } from "@src/infrastructure/crm/repositories/companies/api-company.repository"
import { ApiContactRepository } from "@src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { ApiDealRepository } from "@src/infrastructure/crm/repositories/deals/api-deal.repository"
import { ApiPipelineRepository } from "@src/infrastructure/crm/repositories/pipelines/api-pipeline.repository"
import { ApiNoteRepository } from "@src/infrastructure/crm/repositories/notes/api-note.repository"
import { ApiTaskRepository } from "@src/infrastructure/crm/repositories/tasks/api-task.repository"
import { ApiCallRepository } from "@src/infrastructure/crm/repositories/calls/api-call.repository"
import { ApiTicketRepository } from "@src/infrastructure/crm/repositories/tickets/api-ticket.repository"
import { ApiTicketReplyRepository } from "@src/infrastructure/crm/repositories/tickets/api-ticket-reply.repository"
import { ApiCampaignRepository } from "@src/infrastructure/crm/repositories/campaigns/api-campaign.repository"
import { ApiContractRepository } from "@src/infrastructure/crm/repositories/contracts/api-contract.repository"
import { ApiQuoteRepository } from "@src/infrastructure/crm/repositories/contracts/api-quote.repository"
import { ApiSalesTeamRepository } from "@src/infrastructure/crm/repositories/sales-teams/api-sales-team.repository"
import { ApiHelpdeskRepository, ApiMailboxRepository, ApiThreadRepository } from "@src/infrastructure/crm/repositories/helpdesk/api-helpdesk.repository"
import { ApiAffiliateRepository, ApiAffiliateProgramRepository, ApiCommissionRepository, ApiPayoutRepository } from "@src/infrastructure/crm/repositories/affiliates/api-affiliate.repository"
import { ApiPersonalCrmRepository } from "@src/infrastructure/crm/repositories/personal-crm/api-personal-crm.repository"
import { ApiLoyaltyRepository } from "@src/infrastructure/crm/repositories/loyalty/api-loyalty.repository"
import { ApiTagRepository } from "@src/infrastructure/crm/repositories/tags/api-tag.repository"
import { ApiAutomationRepository } from "@src/infrastructure/crm/repositories/automation/api-automation.repository"
import { ApiScoringRepository } from "@src/infrastructure/crm/repositories/scoring/api-scoring.repository"
import { ApiCpqRepository } from "@src/infrastructure/crm/repositories/cpq/api-cpq.repository"

// Use cases — Companies
import { ListCompaniesUseCase } from "../companies/queries/list-companies.use-case"
import { GetCompanyUseCase } from "../companies/queries/get-company.use-case"
import { CreateCompanyUseCase } from "../companies/use-cases/create-company.use-case"
import { UpdateCompanyUseCase } from "../companies/use-cases/update-company.use-case"
import { DeleteCompanyUseCase } from "../companies/use-cases/delete-company.use-case"

// Use cases — Contacts
import { ListContactsUseCase } from "../contacts/queries/list-contacts.use-case"
import { GetContactUseCase } from "../contacts/queries/get-contact.use-case"
import { CreateContactUseCase } from "../contacts/use-cases/create-contact.use-case"
import { UpdateContactUseCase } from "../contacts/use-cases/update-contact.use-case"
import { DeleteContactUseCase } from "../contacts/use-cases/delete-contact.use-case"

// Use cases — Deals
import { ListDealsUseCase } from "../deals/queries/list-deals.use-case"
import { GetDealUseCase } from "../deals/queries/get-deal.use-case"
import { CreateDealUseCase } from "../deals/use-cases/create-deal.use-case"
import { UpdateDealUseCase } from "../deals/use-cases/update-deal.use-case"
import { DeleteDealUseCase } from "../deals/use-cases/delete-deal.use-case"
import { MoveDealUseCase } from "../deals/use-cases/move-deal.use-case"
import { WinDealUseCase } from "../deals/use-cases/win-deal.use-case"
import { LoseDealUseCase } from "../deals/use-cases/lose-deal.use-case"

// Use cases — Pipelines
import { ListPipelinesUseCase } from "../pipelines/queries/list-pipelines.use-case"
import { GetPipelineBoardUseCase } from "../pipelines/queries/get-pipeline-board.use-case"
import { CreatePipelineUseCase } from "../pipelines/use-cases/create-pipeline.use-case"
import { UpdatePipelineUseCase } from "../pipelines/use-cases/update-pipeline.use-case"
import { DeletePipelineUseCase } from "../pipelines/use-cases/delete-pipeline.use-case"
import { CreateStageUseCase } from "../pipelines/use-cases/create-stage.use-case"
import { ReorderStagesUseCase } from "../pipelines/use-cases/reorder-stages.use-case"

// Use cases — Notes
import { ListNotesUseCase } from "../notes/queries/list-notes.use-case"
import { CreateNoteUseCase } from "../notes/use-cases/create-note.use-case"
import { UpdateNoteUseCase } from "../notes/use-cases/update-note.use-case"
import { DeleteNoteUseCase } from "../notes/use-cases/delete-note.use-case"

// Use cases — Tasks
import { ListTasksUseCase } from "../tasks/queries/list-tasks.use-case"
import { CreateTaskUseCase } from "../tasks/use-cases/create-task.use-case"
import { UpdateTaskUseCase } from "../tasks/use-cases/update-task.use-case"
import { DeleteTaskUseCase } from "../tasks/use-cases/delete-task.use-case"

// Use cases — Calls
import { ListCallsUseCase } from "../calls/queries/list-calls.use-case"
import { CreateCallUseCase } from "../calls/use-cases/create-call.use-case"

// Use cases — Tickets
import { ListTicketsUseCase } from "../support-tickets/queries/list-tickets.use-case"
import { GetTicketUseCase } from "../support-tickets/queries/get-ticket.use-case"
import { CreateTicketUseCase } from "../support-tickets/use-cases/create-ticket.use-case"
import { UpdateTicketUseCase } from "../support-tickets/use-cases/update-ticket.use-case"
import { DeleteTicketUseCase } from "../support-tickets/use-cases/delete-ticket.use-case"
import { ListTicketRepliesUseCase } from "../support-tickets/queries/list-ticket-replies.use-case"
import { CreateTicketReplyUseCase } from "../support-tickets/use-cases/create-ticket-reply.use-case"

// Use cases — Campaigns
import { ListCampaignsUseCase } from "../campaigns/queries/list-campaigns.use-case"
import { GetCampaignUseCase } from "../campaigns/queries/get-campaign.use-case"
import { CreateCampaignUseCase } from "../campaigns/use-cases/create-campaign.use-case"
import { UpdateCampaignUseCase } from "../campaigns/use-cases/update-campaign.use-case"
import { DeleteCampaignUseCase } from "../campaigns/use-cases/delete-campaign.use-case"
import { AddCampaignMemberUseCase } from "../campaigns/use-cases/add-campaign-member.use-case"
import { ListCampaignMembersUseCase } from "../campaigns/queries/list-campaign-members.use-case"

// Use cases — Contracts
import { ListContractsUseCase } from "../contracts/queries/list-contracts.use-case"
import { GetContractUseCase } from "../contracts/queries/get-contract.use-case"
import { CreateContractUseCase } from "../contracts/use-cases/create-contract.use-case"
import { UpdateContractUseCase } from "../contracts/use-cases/update-contract.use-case"
import { DeleteContractUseCase } from "../contracts/use-cases/delete-contract.use-case"
import { RenewContractUseCase } from "../contracts/use-cases/renew-contract.use-case"
import { UpdateContractStatusUseCase } from "../contracts/use-cases/update-contract-status.use-case"

// Use cases — Quotes
import { ListQuotesUseCase } from "../quotes/queries/list-quotes.use-case"
import { GetQuoteUseCase } from "../quotes/queries/get-quote.use-case"
import { CreateQuoteUseCase } from "../quotes/use-cases/create-quote.use-case"
import { AcceptQuoteUseCase } from "../quotes/use-cases/accept-quote.use-case"
import { DeleteQuoteUseCase } from "../quotes/use-cases/delete-quote.use-case"
import { RejectQuoteUseCase } from "../quotes/use-cases/reject-quote.use-case"
import { SendQuoteUseCase } from "../quotes/use-cases/send-quote.use-case"

// Use cases — Sales Teams
import { ListSalesTeamsUseCase } from "../sales-teams/queries/list-sales-teams.use-case"
import { GetSalesTeamUseCase } from "../sales-teams/queries/get-sales-team.use-case"
import { CreateSalesTeamUseCase } from "../sales-teams/use-cases/create-sales-team.use-case"
import { UpdateSalesTeamUseCase } from "../sales-teams/use-cases/update-sales-team.use-case"
import { DeleteSalesTeamUseCase } from "../sales-teams/use-cases/delete-sales-team.use-case"
import { ListTeamMembersUseCase } from "../sales-teams/queries/list-team-members.use-case"
import { AddTeamMemberUseCase } from "../sales-teams/use-cases/add-team-member.use-case"
import { RemoveTeamMemberUseCase } from "../sales-teams/use-cases/remove-team-member.use-case"
import { ListTeamQuotasUseCase } from "../sales-teams/queries/list-team-quotas.use-case"
import { CreateTeamQuotaUseCase } from "../sales-teams/use-cases/create-team-quota.use-case"

// Use cases — Helpdesk
import { ListConversationsUseCase } from "../helpdesk/queries/list-conversations.use-case"
import { GetConversationUseCase } from "../helpdesk/queries/get-conversation.use-case"
import { CreateConversationUseCase } from "../helpdesk/use-cases/create-conversation.use-case"
import { UpdateConversationUseCase } from "../helpdesk/use-cases/update-conversation.use-case"
import { AssignConversationUseCase } from "../helpdesk/use-cases/assign-conversation.use-case"
import { CloseConversationUseCase } from "../helpdesk/use-cases/close-conversation.use-case"
import { ResolveConversationUseCase } from "../helpdesk/use-cases/resolve-conversation.use-case"
import { ListMailboxesUseCase } from "../helpdesk/queries/list-mailboxes.use-case"
import { CreateMailboxUseCase } from "../helpdesk/use-cases/create-mailbox.use-case"
import { ListThreadsUseCase } from "../helpdesk/queries/list-threads.use-case"
import { CreateThreadUseCase } from "../helpdesk/use-cases/create-thread.use-case"

// Use cases — Affiliates
import { ListAffiliatesUseCase } from "../affiliates/queries/list-affiliates.use-case"
import { GetAffiliateUseCase } from "../affiliates/queries/get-affiliate.use-case"
import { CreateAffiliateUseCase } from "../affiliates/use-cases/create-affiliate.use-case"
import { ListProgramsUseCase } from "../affiliates/queries/list-programs.use-case"
import { GetProgramUseCase } from "../affiliates/queries/get-program.use-case"
import { CreateProgramUseCase } from "../affiliates/use-cases/create-program.use-case"
import { UpdateProgramUseCase } from "../affiliates/use-cases/update-program.use-case"
import { DeleteProgramUseCase } from "../affiliates/use-cases/delete-program.use-case"
import { ListCommissionsUseCase } from "../affiliates/queries/list-commissions.use-case"
import { CreateCommissionUseCase } from "../affiliates/use-cases/create-commission.use-case"
import { ListPayoutsUseCase } from "../affiliates/queries/list-payouts.use-case"
import { CreatePayoutUseCase } from "../affiliates/use-cases/create-payout.use-case"

// Use cases — Personal CRM
import { ListLifeEventsUseCase } from "../personal-crm/queries/list-life-events.use-case"
import { CreateLifeEventUseCase } from "../personal-crm/use-cases/create-life-event.use-case"
import { ListGiftsUseCase } from "../personal-crm/queries/list-gifts.use-case"
import { CreateGiftUseCase } from "../personal-crm/use-cases/create-gift.use-case"
import { ListDebtsUseCase } from "../personal-crm/queries/list-debts.use-case"
import { CreateDebtUseCase } from "../personal-crm/use-cases/create-debt.use-case"
import { SettleDebtUseCase } from "../personal-crm/use-cases/settle-debt.use-case"
import { ListRemindersUseCase } from "../personal-crm/queries/list-reminders.use-case"
import { CreateReminderUseCase } from "../personal-crm/use-cases/create-reminder.use-case"
import { ToggleReminderUseCase } from "../personal-crm/use-cases/toggle-reminder.use-case"
import { ListPetsUseCase } from "../personal-crm/queries/list-pets.use-case"
import { CreatePetUseCase } from "../personal-crm/use-cases/create-pet.use-case"

// Use cases — Loyalty
import { GetProfileUseCase } from "../loyalty/queries/get-profile.use-case"
import { EarnPointsUseCase } from "../loyalty/use-cases/earn-points.use-case"
import { RedeemPointsUseCase } from "../loyalty/use-cases/redeem-points.use-case"
import { ListSegmentsUseCase } from "../loyalty/queries/list-segments.use-case"
import { CreateSegmentUseCase } from "../loyalty/use-cases/create-segment.use-case"
import { AssignToSegmentUseCase } from "../loyalty/use-cases/assign-to-segment.use-case"

// Use cases — Tags
import { ListTagsUseCase } from "../tags/queries/list-tags.use-case"
import { GetTagUseCase } from "../tags/queries/get-tag.use-case"
import { CreateTagUseCase } from "../tags/use-cases/create-tag.use-case"
import { UpdateTagUseCase } from "../tags/use-cases/update-tag.use-case"
import { DeleteTagUseCase } from "../tags/use-cases/delete-tag.use-case"

export function registerDependencies() {
  // Register repositories
  container.register(DI_TOKENS.CompanyRepository, ApiCompanyRepository)
  container.register(DI_TOKENS.ContactRepository, ApiContactRepository)
  container.register(DI_TOKENS.DealRepository, ApiDealRepository)
  container.register(DI_TOKENS.PipelineRepository, ApiPipelineRepository)
  container.register(DI_TOKENS.NoteRepository, ApiNoteRepository)
  container.register(DI_TOKENS.TaskRepository, ApiTaskRepository)
  container.register(DI_TOKENS.CallRepository, ApiCallRepository)
  container.register(DI_TOKENS.TicketRepository, ApiTicketRepository)
  container.register(DI_TOKENS.TicketReplyRepository, ApiTicketReplyRepository)
  container.register(DI_TOKENS.CampaignRepository, ApiCampaignRepository)
  container.register(DI_TOKENS.ContractRepository, ApiContractRepository)
  container.register(DI_TOKENS.QuoteRepository, ApiQuoteRepository)
  container.register(DI_TOKENS.SalesTeamRepository, ApiSalesTeamRepository)
  container.register(DI_TOKENS.HelpdeskRepository, ApiHelpdeskRepository)
  container.register(DI_TOKENS.AffiliateRepository, ApiAffiliateRepository)
  container.register(DI_TOKENS.AffiliateProgramRepository, ApiAffiliateProgramRepository)
  container.register(DI_TOKENS.CommissionRepository, ApiCommissionRepository)
  container.register(DI_TOKENS.PayoutRepository, ApiPayoutRepository)
  container.register(DI_TOKENS.PersonalCRMRepository, ApiPersonalCrmRepository)
  container.register(DI_TOKENS.LoyaltyProfileRepository, ApiLoyaltyRepository)
  container.register(DI_TOKENS.CustomerSegmentRepository, ApiLoyaltyRepository)
  container.register(DI_TOKENS.TagRepository, ApiTagRepository)
  container.register(DI_TOKENS.AutomationRepository, ApiAutomationRepository)
  container.register(DI_TOKENS.ScoringRepository, ApiScoringRepository)
  container.register(DI_TOKENS.CpqRepository, ApiCpqRepository)

  const compRepo = ApiCompanyRepository as any
  const contactRepo = ApiContactRepository as any
  const dealRepo = ApiDealRepository as any
  const pipelineRepo = ApiPipelineRepository as any
  const noteRepo = ApiNoteRepository as any
  const taskRepo = ApiTaskRepository as any
  const callRepo = ApiCallRepository as any
  const ticketRepo = ApiTicketRepository as any
  const replyRepo = ApiTicketReplyRepository as any
  const campaignRepo = ApiCampaignRepository as any
  const contractRepo = ApiContractRepository as any
  const quoteRepo = ApiQuoteRepository as any
  const teamRepo = ApiSalesTeamRepository as any
  const helpdeskRepo = ApiHelpdeskRepository as any
  const mailboxRepo = ApiMailboxRepository as any
  const threadRepo = ApiThreadRepository as any
  const affiliateRepo = ApiAffiliateRepository as any
  const programRepo = ApiAffiliateProgramRepository as any
  const commissionRepo = ApiCommissionRepository as any
  const payoutRepo = ApiPayoutRepository as any
  const personalRepo = ApiPersonalCrmRepository as any
  const loyaltyRepo = ApiLoyaltyRepository as any
  const tagRepo = ApiTagRepository as any

  // Register use cases — Companies
  container.register(DI_TOKENS.ListCompanies, new ListCompaniesUseCase(compRepo))
  container.register(DI_TOKENS.GetCompany, new GetCompanyUseCase(compRepo))
  container.register(DI_TOKENS.CreateCompany, new CreateCompanyUseCase(compRepo))
  container.register(DI_TOKENS.UpdateCompany, new UpdateCompanyUseCase(compRepo))
  container.register(DI_TOKENS.DeleteCompany, new DeleteCompanyUseCase(compRepo))

  // Contacts
  container.register(DI_TOKENS.ListContacts, new ListContactsUseCase(contactRepo))
  container.register(DI_TOKENS.GetContact, new GetContactUseCase(contactRepo))
  container.register(DI_TOKENS.CreateContact, new CreateContactUseCase(contactRepo))
  container.register(DI_TOKENS.UpdateContact, new UpdateContactUseCase(contactRepo))
  container.register(DI_TOKENS.DeleteContact, new DeleteContactUseCase(contactRepo))

  // Deals
  container.register(DI_TOKENS.ListDeals, new ListDealsUseCase(dealRepo))
  container.register(DI_TOKENS.GetDeal, new GetDealUseCase(dealRepo))
  container.register(DI_TOKENS.CreateDeal, new CreateDealUseCase(dealRepo))
  container.register(DI_TOKENS.UpdateDeal, new UpdateDealUseCase(dealRepo))
  container.register(DI_TOKENS.DeleteDeal, new DeleteDealUseCase(dealRepo))
  container.register(DI_TOKENS.MoveDeal, new MoveDealUseCase(dealRepo))
  container.register(DI_TOKENS.WinDeal, new WinDealUseCase(dealRepo))
  container.register(DI_TOKENS.LoseDeal, new LoseDealUseCase(dealRepo))

  // Pipelines
  container.register(DI_TOKENS.ListPipelines, new ListPipelinesUseCase(pipelineRepo))
  container.register(DI_TOKENS.GetPipelineBoard, new GetPipelineBoardUseCase(pipelineRepo))
  container.register(DI_TOKENS.CreatePipeline, new CreatePipelineUseCase(pipelineRepo))
  container.register(DI_TOKENS.UpdatePipeline, new UpdatePipelineUseCase(pipelineRepo))
  container.register(DI_TOKENS.DeletePipeline, new DeletePipelineUseCase(pipelineRepo))
  container.register(DI_TOKENS.CreateStage, new CreateStageUseCase(pipelineRepo))
  container.register(DI_TOKENS.ReorderStages, new ReorderStagesUseCase(pipelineRepo))

  // Notes
  container.register(DI_TOKENS.ListNotes, new ListNotesUseCase(noteRepo))
  container.register(DI_TOKENS.CreateNote, new CreateNoteUseCase(noteRepo))
  container.register(DI_TOKENS.UpdateNote, new UpdateNoteUseCase(noteRepo))
  container.register(DI_TOKENS.DeleteNote, new DeleteNoteUseCase(noteRepo))

  // Tasks
  container.register(DI_TOKENS.ListTasks, new ListTasksUseCase(taskRepo))
  container.register(DI_TOKENS.CreateTask, new CreateTaskUseCase(taskRepo))
  container.register(DI_TOKENS.UpdateTask, new UpdateTaskUseCase(taskRepo))
  container.register(DI_TOKENS.DeleteTask, new DeleteTaskUseCase(taskRepo))

  // Calls
  container.register(DI_TOKENS.ListCalls, new ListCallsUseCase(callRepo))
  container.register(DI_TOKENS.CreateCall, new CreateCallUseCase(callRepo))

  // Tickets
  container.register(DI_TOKENS.ListTickets, new ListTicketsUseCase(ticketRepo))
  container.register(DI_TOKENS.GetTicket, new GetTicketUseCase(ticketRepo))
  container.register(DI_TOKENS.CreateTicket, new CreateTicketUseCase(ticketRepo))
  container.register(DI_TOKENS.UpdateTicket, new UpdateTicketUseCase(ticketRepo))
  container.register(DI_TOKENS.DeleteTicket, new DeleteTicketUseCase(ticketRepo))
  container.register(DI_TOKENS.ListTicketReplies, new ListTicketRepliesUseCase(replyRepo))
  container.register(DI_TOKENS.CreateTicketReply, new CreateTicketReplyUseCase(replyRepo))

  // Campaigns
  container.register(DI_TOKENS.ListCampaigns, new ListCampaignsUseCase(campaignRepo))
  container.register(DI_TOKENS.GetCampaign, new GetCampaignUseCase(campaignRepo))
  container.register(DI_TOKENS.CreateCampaign, new CreateCampaignUseCase(campaignRepo))
  container.register(DI_TOKENS.UpdateCampaign, new UpdateCampaignUseCase(campaignRepo))
  container.register(DI_TOKENS.DeleteCampaign, new DeleteCampaignUseCase(campaignRepo))
  container.register(DI_TOKENS.AddCampaignMember, new AddCampaignMemberUseCase(campaignRepo))
  container.register(DI_TOKENS.ListCampaignMembers, new ListCampaignMembersUseCase(campaignRepo))

  // Contracts
  container.register(DI_TOKENS.ListContracts, new ListContractsUseCase(contractRepo))
  container.register(DI_TOKENS.GetContract, new GetContractUseCase(contractRepo))
  container.register(DI_TOKENS.CreateContract, new CreateContractUseCase(contractRepo))
  container.register(DI_TOKENS.UpdateContract, new UpdateContractUseCase(contractRepo))
  container.register(DI_TOKENS.DeleteContract, new DeleteContractUseCase(contractRepo))
  container.register(DI_TOKENS.RenewContract, new RenewContractUseCase(contractRepo))
  container.register(DI_TOKENS.UpdateContractStatus, new UpdateContractStatusUseCase(contractRepo))

  // Quotes
  container.register(DI_TOKENS.ListQuotes, new ListQuotesUseCase(quoteRepo))
  container.register(DI_TOKENS.GetQuote, new GetQuoteUseCase(quoteRepo))
  container.register(DI_TOKENS.CreateQuote, new CreateQuoteUseCase(quoteRepo))
  container.register(DI_TOKENS.AcceptQuote, new AcceptQuoteUseCase(quoteRepo))
  container.register(DI_TOKENS.RejectQuote, new RejectQuoteUseCase(quoteRepo))
  container.register(DI_TOKENS.SendQuote, new SendQuoteUseCase(quoteRepo))
  container.register(DI_TOKENS.DeleteQuote, new DeleteQuoteUseCase(quoteRepo))

  // Sales Teams
  container.register(DI_TOKENS.ListSalesTeams, new ListSalesTeamsUseCase(teamRepo))
  container.register(DI_TOKENS.GetSalesTeam, new GetSalesTeamUseCase(teamRepo))
  container.register(DI_TOKENS.CreateSalesTeam, new CreateSalesTeamUseCase(teamRepo))
  container.register(DI_TOKENS.UpdateSalesTeam, new UpdateSalesTeamUseCase(teamRepo))
  container.register(DI_TOKENS.DeleteSalesTeam, new DeleteSalesTeamUseCase(teamRepo))
  container.register(DI_TOKENS.ListTeamMembers, new ListTeamMembersUseCase(teamRepo))
  container.register(DI_TOKENS.AddTeamMember, new AddTeamMemberUseCase(teamRepo))
  container.register(DI_TOKENS.RemoveTeamMember, new RemoveTeamMemberUseCase(teamRepo))
  container.register(DI_TOKENS.ListTeamQuotas, new ListTeamQuotasUseCase(teamRepo))
  container.register(DI_TOKENS.CreateTeamQuota, new CreateTeamQuotaUseCase(teamRepo))

  // Helpdesk
  container.register(DI_TOKENS.ListConversations, new ListConversationsUseCase(helpdeskRepo))
  container.register(DI_TOKENS.GetConversation, new GetConversationUseCase(helpdeskRepo))
  container.register(DI_TOKENS.CreateConversation, new CreateConversationUseCase(helpdeskRepo))
  container.register(DI_TOKENS.UpdateConversation, new UpdateConversationUseCase(helpdeskRepo))
  container.register(DI_TOKENS.AssignConversation, new AssignConversationUseCase(helpdeskRepo))
  container.register(DI_TOKENS.CloseConversation, new CloseConversationUseCase(helpdeskRepo))
  container.register(DI_TOKENS.ResolveConversation, new ResolveConversationUseCase(helpdeskRepo))
  container.register(DI_TOKENS.ListMailboxes, new ListMailboxesUseCase(mailboxRepo))
  container.register(DI_TOKENS.CreateMailbox, new CreateMailboxUseCase(mailboxRepo))
  container.register(DI_TOKENS.ListThreads, new ListThreadsUseCase(threadRepo))
  container.register(DI_TOKENS.CreateThread, new CreateThreadUseCase(threadRepo))

  // Affiliates
  container.register(DI_TOKENS.ListAffiliates, new ListAffiliatesUseCase(affiliateRepo))
  container.register(DI_TOKENS.GetAffiliate, new GetAffiliateUseCase(affiliateRepo))
  container.register(DI_TOKENS.CreateAffiliate, new CreateAffiliateUseCase(affiliateRepo))
  container.register(DI_TOKENS.ListPrograms, new ListProgramsUseCase(programRepo))
  container.register(DI_TOKENS.GetProgram, new GetProgramUseCase(programRepo))
  container.register(DI_TOKENS.CreateProgram, new CreateProgramUseCase(programRepo))
  container.register(DI_TOKENS.UpdateProgram, new UpdateProgramUseCase(programRepo))
  container.register(DI_TOKENS.DeleteProgram, new DeleteProgramUseCase(programRepo))
  container.register(DI_TOKENS.ListCommissions, new ListCommissionsUseCase(commissionRepo))
  container.register(DI_TOKENS.CreateCommission, new CreateCommissionUseCase(commissionRepo))
  container.register(DI_TOKENS.ListPayouts, new ListPayoutsUseCase(payoutRepo))
  container.register(DI_TOKENS.CreatePayout, new CreatePayoutUseCase(payoutRepo))

  // Personal CRM
  container.register(DI_TOKENS.ListLifeEvents, new ListLifeEventsUseCase(personalRepo))
  container.register(DI_TOKENS.CreateLifeEvent, new CreateLifeEventUseCase(personalRepo))
  container.register(DI_TOKENS.ListGifts, new ListGiftsUseCase(personalRepo))
  container.register(DI_TOKENS.CreateGift, new CreateGiftUseCase(personalRepo))
  container.register(DI_TOKENS.ListDebts, new ListDebtsUseCase(personalRepo))
  container.register(DI_TOKENS.CreateDebt, new CreateDebtUseCase(personalRepo))
  container.register(DI_TOKENS.SettleDebt, new SettleDebtUseCase(personalRepo))
  container.register(DI_TOKENS.ListReminders, new ListRemindersUseCase(personalRepo))
  container.register(DI_TOKENS.CreateReminder, new CreateReminderUseCase(personalRepo))
  container.register(DI_TOKENS.ToggleReminder, new ToggleReminderUseCase(personalRepo))
  container.register(DI_TOKENS.ListPets, new ListPetsUseCase(personalRepo))
  container.register(DI_TOKENS.CreatePet, new CreatePetUseCase(personalRepo))

  // Loyalty
  container.register(DI_TOKENS.GetLoyaltyProfile, new GetProfileUseCase(loyaltyRepo))
  container.register(DI_TOKENS.EarnPoints, new EarnPointsUseCase(loyaltyRepo))
  container.register(DI_TOKENS.RedeemPoints, new RedeemPointsUseCase(loyaltyRepo))
  container.register(DI_TOKENS.ListSegments, new ListSegmentsUseCase(loyaltyRepo))
  container.register(DI_TOKENS.CreateSegment, new CreateSegmentUseCase(loyaltyRepo))
  container.register(DI_TOKENS.AssignToSegment, new AssignToSegmentUseCase(loyaltyRepo))

  // Tags
  container.register(DI_TOKENS.ListTags, new ListTagsUseCase(tagRepo))
  container.register(DI_TOKENS.GetTag, new GetTagUseCase(tagRepo))
  container.register(DI_TOKENS.CreateTag, new CreateTagUseCase(tagRepo))
  container.register(DI_TOKENS.UpdateTag, new UpdateTagUseCase(tagRepo))
  container.register(DI_TOKENS.DeleteTag, new DeleteTagUseCase(tagRepo))
}

