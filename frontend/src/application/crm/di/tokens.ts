export const DI_TOKENS = {
  // Repositories
  CompanyRepository: Symbol("CompanyRepository"),
  ContactRepository: Symbol("ContactRepository"),
  DealRepository: Symbol("DealRepository"),
  PipelineRepository: Symbol("PipelineRepository"),
  NoteRepository: Symbol("NoteRepository"),
  TaskRepository: Symbol("TaskRepository"),
  CallRepository: Symbol("CallRepository"),
  ListCalls: Symbol("ListCalls"),
  TicketRepository: Symbol("TicketRepository"),
  TicketReplyRepository: Symbol("TicketReplyRepository"),
  CampaignRepository: Symbol("CampaignRepository"),
  ContractRepository: Symbol("ContractRepository"),
  QuoteRepository: Symbol("QuoteRepository"),
  SalesTeamRepository: Symbol("SalesTeamRepository"),
  HelpdeskRepository: Symbol("HelpdeskRepository"),
  AffiliateRepository: Symbol("AffiliateRepository"),
  AffiliateProgramRepository: Symbol("AffiliateProgramRepository"),
  CommissionRepository: Symbol("CommissionRepository"),
  PayoutRepository: Symbol("PayoutRepository"),
  PersonalCRMRepository: Symbol("PersonalCRMRepository"),
  LoyaltyProfileRepository: Symbol("LoyaltyProfileRepository"),
  CustomerSegmentRepository: Symbol("CustomerSegmentRepository"),
  TagRepository: Symbol("TagRepository"),
  AutomationRepository: Symbol("AutomationRepository"),
  ScoringRepository: Symbol("ScoringRepository"),
  CpqRepository: Symbol("CpqRepository"),

  // Companies
  ListCompanies: Symbol("ListCompanies"),
  GetCompany: Symbol("GetCompany"),
  CreateCompany: Symbol("CreateCompany"),
  UpdateCompany: Symbol("UpdateCompany"),
  DeleteCompany: Symbol("DeleteCompany"),

  // Contacts
  ListContacts: Symbol("ListContacts"),
  GetContact: Symbol("GetContact"),
  CreateContact: Symbol("CreateContact"),
  UpdateContact: Symbol("UpdateContact"),
  DeleteContact: Symbol("DeleteContact"),

  // Deals
  ListDeals: Symbol("ListDeals"),
  GetDeal: Symbol("GetDeal"),
  CreateDeal: Symbol("CreateDeal"),
  UpdateDeal: Symbol("UpdateDeal"),
  DeleteDeal: Symbol("DeleteDeal"),
  MoveDeal: Symbol("MoveDeal"),
  WinDeal: Symbol("WinDeal"),
  LoseDeal: Symbol("LoseDeal"),

  // Pipelines
  ListPipelines: Symbol("ListPipelines"),
  GetPipelineBoard: Symbol("GetPipelineBoard"),
  CreatePipeline: Symbol("CreatePipeline"),
  UpdatePipeline: Symbol("UpdatePipeline"),
  DeletePipeline: Symbol("DeletePipeline"),
  CreateStage: Symbol("CreateStage"),
  ReorderStages: Symbol("ReorderStages"),

  // Notes
  ListNotes: Symbol("ListNotes"),
  CreateNote: Symbol("CreateNote"),
  UpdateNote: Symbol("UpdateNote"),
  DeleteNote: Symbol("DeleteNote"),

  // Tasks
  ListTasks: Symbol("ListTasks"),
  CreateTask: Symbol("CreateTask"),
  UpdateTask: Symbol("UpdateTask"),
  DeleteTask: Symbol("DeleteTask"),

  // Calls
  CreateCall: Symbol("CreateCall"),

  // Support Tickets
  ListTickets: Symbol("ListTickets"),
  GetTicket: Symbol("GetTicket"),
  CreateTicket: Symbol("CreateTicket"),
  UpdateTicket: Symbol("UpdateTicket"),
  DeleteTicket: Symbol("DeleteTicket"),
  ListTicketReplies: Symbol("ListTicketReplies"),
  CreateTicketReply: Symbol("CreateTicketReply"),

  // Campaigns
  ListCampaigns: Symbol("ListCampaigns"),
  GetCampaign: Symbol("GetCampaign"),
  CreateCampaign: Symbol("CreateCampaign"),
  UpdateCampaign: Symbol("UpdateCampaign"),
  DeleteCampaign: Symbol("DeleteCampaign"),
  AddCampaignMember: Symbol("AddCampaignMember"),
  ListCampaignMembers: Symbol("ListCampaignMembers"),

  // Contracts
  ListContracts: Symbol("ListContracts"),
  GetContract: Symbol("GetContract"),
  CreateContract: Symbol("CreateContract"),
  UpdateContract: Symbol("UpdateContract"),
  DeleteContract: Symbol("DeleteContract"),
  RenewContract: Symbol("RenewContract"),
  UpdateContractStatus: Symbol("UpdateContractStatus"),

  // Quotes
  ListQuotes: Symbol("ListQuotes"),
  GetQuote: Symbol("GetQuote"),
  CreateQuote: Symbol("CreateQuote"),
  AcceptQuote: Symbol("AcceptQuote"),
  RejectQuote: Symbol("RejectQuote"),
  SendQuote: Symbol("SendQuote"),
  DeleteQuote: Symbol("DeleteQuote"),

  // Sales Teams
  ListSalesTeams: Symbol("ListSalesTeams"),
  GetSalesTeam: Symbol("GetSalesTeam"),
  CreateSalesTeam: Symbol("CreateSalesTeam"),
  UpdateSalesTeam: Symbol("UpdateSalesTeam"),
  DeleteSalesTeam: Symbol("DeleteSalesTeam"),
  ListTeamMembers: Symbol("ListTeamMembers"),
  AddTeamMember: Symbol("AddTeamMember"),
  RemoveTeamMember: Symbol("RemoveTeamMember"),
  ListTeamQuotas: Symbol("ListTeamQuotas"),
  CreateTeamQuota: Symbol("CreateTeamQuota"),

  // Helpdesk
  ListConversations: Symbol("ListConversations"),
  GetConversation: Symbol("GetConversation"),
  CreateConversation: Symbol("CreateConversation"),
  UpdateConversation: Symbol("UpdateConversation"),
  AssignConversation: Symbol("AssignConversation"),
  CloseConversation: Symbol("CloseConversation"),
  ResolveConversation: Symbol("ResolveConversation"),
  ListMailboxes: Symbol("ListMailboxes"),
  CreateMailbox: Symbol("CreateMailbox"),
  ListThreads: Symbol("ListThreads"),
  CreateThread: Symbol("CreateThread"),

  // Affiliates
  ListAffiliates: Symbol("ListAffiliates"),
  GetAffiliate: Symbol("GetAffiliate"),
  CreateAffiliate: Symbol("CreateAffiliate"),
  ListPrograms: Symbol("ListPrograms"),
  GetProgram: Symbol("GetProgram"),
  CreateProgram: Symbol("CreateProgram"),
  UpdateProgram: Symbol("UpdateProgram"),
  DeleteProgram: Symbol("DeleteProgram"),
  ListCommissions: Symbol("ListCommissions"),
  CreateCommission: Symbol("CreateCommission"),
  ListPayouts: Symbol("ListPayouts"),
  CreatePayout: Symbol("CreatePayout"),

  // Personal CRM
  ListLifeEvents: Symbol("ListLifeEvents"),
  CreateLifeEvent: Symbol("CreateLifeEvent"),
  ListGifts: Symbol("ListGifts"),
  CreateGift: Symbol("CreateGift"),
  ListDebts: Symbol("ListDebts"),
  CreateDebt: Symbol("CreateDebt"),
  SettleDebt: Symbol("SettleDebt"),
  ListReminders: Symbol("ListReminders"),
  CreateReminder: Symbol("CreateReminder"),
  ToggleReminder: Symbol("ToggleReminder"),
  ListPets: Symbol("ListPets"),
  CreatePet: Symbol("CreatePet"),

  // Loyalty
  GetLoyaltyProfile: Symbol("GetLoyaltyProfile"),
  EarnPoints: Symbol("EarnPoints"),
  RedeemPoints: Symbol("RedeemPoints"),
  ListSegments: Symbol("ListSegments"),
  CreateSegment: Symbol("CreateSegment"),
  AssignToSegment: Symbol("AssignToSegment"),

  // Tags
  ListTags: Symbol("ListTags"),
  GetTag: Symbol("GetTag"),
  CreateTag: Symbol("CreateTag"),
  UpdateTag: Symbol("UpdateTag"),
  DeleteTag: Symbol("DeleteTag"),
} as const
