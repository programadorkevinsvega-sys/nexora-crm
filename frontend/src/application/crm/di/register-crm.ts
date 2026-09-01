/* eslint-disable @typescript-eslint/no-explicit-any */
import { container } from "./container"
import { DI_TOKENS } from "./tokens"

import { ApiCompanyRepository } from "@src/infrastructure/crm/repositories/companies/api-company.repository"
import { ApiContactRepository } from "@src/infrastructure/crm/repositories/contacts/api-contact.repository"
import { ApiDealRepository } from "@src/infrastructure/crm/repositories/deals/api-deal.repository"
import { ApiPipelineRepository } from "@src/infrastructure/crm/repositories/pipelines/api-pipeline.repository"
import { ApiNoteRepository } from "@src/infrastructure/crm/repositories/notes/api-note.repository"
import { ApiTaskRepository } from "@src/infrastructure/crm/repositories/tasks/api-task.repository"
import { ApiCallRepository } from "@src/infrastructure/crm/repositories/calls/api-call.repository"

import { ListCompaniesUseCase } from "../companies/queries/list-companies.use-case"
import { GetCompanyUseCase } from "../companies/queries/get-company.use-case"
import { CreateCompanyUseCase } from "../companies/use-cases/create-company.use-case"
import { UpdateCompanyUseCase } from "../companies/use-cases/update-company.use-case"
import { DeleteCompanyUseCase } from "../companies/use-cases/delete-company.use-case"

import { ListContactsUseCase } from "../contacts/queries/list-contacts.use-case"
import { GetContactUseCase } from "../contacts/queries/get-contact.use-case"
import { CreateContactUseCase } from "../contacts/use-cases/create-contact.use-case"
import { UpdateContactUseCase } from "../contacts/use-cases/update-contact.use-case"
import { DeleteContactUseCase } from "../contacts/use-cases/delete-contact.use-case"

import { ListDealsUseCase } from "../deals/queries/list-deals.use-case"
import { GetDealUseCase } from "../deals/queries/get-deal.use-case"
import { CreateDealUseCase } from "../deals/use-cases/create-deal.use-case"
import { UpdateDealUseCase } from "../deals/use-cases/update-deal.use-case"
import { DeleteDealUseCase } from "../deals/use-cases/delete-deal.use-case"
import { MoveDealUseCase } from "../deals/use-cases/move-deal.use-case"
import { WinDealUseCase } from "../deals/use-cases/win-deal.use-case"
import { LoseDealUseCase } from "../deals/use-cases/lose-deal.use-case"

import { ListPipelinesUseCase } from "../pipelines/queries/list-pipelines.use-case"
import { GetPipelineBoardUseCase } from "../pipelines/queries/get-pipeline-board.use-case"
import { CreatePipelineUseCase } from "../pipelines/use-cases/create-pipeline.use-case"
import { UpdatePipelineUseCase } from "../pipelines/use-cases/update-pipeline.use-case"
import { DeletePipelineUseCase } from "../pipelines/use-cases/delete-pipeline.use-case"
import { CreateStageUseCase } from "../pipelines/use-cases/create-stage.use-case"
import { ReorderStagesUseCase } from "../pipelines/use-cases/reorder-stages.use-case"

import { ListNotesUseCase } from "../notes/queries/list-notes.use-case"
import { CreateNoteUseCase } from "../notes/use-cases/create-note.use-case"
import { UpdateNoteUseCase } from "../notes/use-cases/update-note.use-case"
import { DeleteNoteUseCase } from "../notes/use-cases/delete-note.use-case"

import { ListTasksUseCase } from "../tasks/queries/list-tasks.use-case"
import { CreateTaskUseCase } from "../tasks/use-cases/create-task.use-case"
import { UpdateTaskUseCase } from "../tasks/use-cases/update-task.use-case"
import { DeleteTaskUseCase } from "../tasks/use-cases/delete-task.use-case"

import { ListCallsUseCase } from "../calls/queries/list-calls.use-case"
import { CreateCallUseCase } from "../calls/use-cases/create-call.use-case"

export function registerCrmDependencies() {
  container.register(DI_TOKENS.CompanyRepository, ApiCompanyRepository)
  container.register(DI_TOKENS.ContactRepository, ApiContactRepository)
  container.register(DI_TOKENS.DealRepository, ApiDealRepository)
  container.register(DI_TOKENS.PipelineRepository, ApiPipelineRepository)
  container.register(DI_TOKENS.NoteRepository, ApiNoteRepository)
  container.register(DI_TOKENS.TaskRepository, ApiTaskRepository)
  container.register(DI_TOKENS.CallRepository, ApiCallRepository)

  const compRepo = ApiCompanyRepository as any
  const contactRepo = ApiContactRepository as any
  const dealRepo = ApiDealRepository as any
  const pipelineRepo = ApiPipelineRepository as any
  const noteRepo = ApiNoteRepository as any
  const taskRepo = ApiTaskRepository as any
  const callRepo = ApiCallRepository as any

  container.register(DI_TOKENS.ListCompanies, new ListCompaniesUseCase(compRepo))
  container.register(DI_TOKENS.GetCompany, new GetCompanyUseCase(compRepo))
  container.register(DI_TOKENS.CreateCompany, new CreateCompanyUseCase(compRepo))
  container.register(DI_TOKENS.UpdateCompany, new UpdateCompanyUseCase(compRepo))
  container.register(DI_TOKENS.DeleteCompany, new DeleteCompanyUseCase(compRepo))

  container.register(DI_TOKENS.ListContacts, new ListContactsUseCase(contactRepo))
  container.register(DI_TOKENS.GetContact, new GetContactUseCase(contactRepo))
  container.register(DI_TOKENS.CreateContact, new CreateContactUseCase(contactRepo))
  container.register(DI_TOKENS.UpdateContact, new UpdateContactUseCase(contactRepo))
  container.register(DI_TOKENS.DeleteContact, new DeleteContactUseCase(contactRepo))

  container.register(DI_TOKENS.ListDeals, new ListDealsUseCase(dealRepo))
  container.register(DI_TOKENS.GetDeal, new GetDealUseCase(dealRepo))
  container.register(DI_TOKENS.CreateDeal, new CreateDealUseCase(dealRepo))
  container.register(DI_TOKENS.UpdateDeal, new UpdateDealUseCase(dealRepo))
  container.register(DI_TOKENS.DeleteDeal, new DeleteDealUseCase(dealRepo))
  container.register(DI_TOKENS.MoveDeal, new MoveDealUseCase(dealRepo))
  container.register(DI_TOKENS.WinDeal, new WinDealUseCase(dealRepo))
  container.register(DI_TOKENS.LoseDeal, new LoseDealUseCase(dealRepo))

  container.register(DI_TOKENS.ListPipelines, new ListPipelinesUseCase(pipelineRepo))
  container.register(DI_TOKENS.GetPipelineBoard, new GetPipelineBoardUseCase(pipelineRepo))
  container.register(DI_TOKENS.CreatePipeline, new CreatePipelineUseCase(pipelineRepo))
  container.register(DI_TOKENS.UpdatePipeline, new UpdatePipelineUseCase(pipelineRepo))
  container.register(DI_TOKENS.DeletePipeline, new DeletePipelineUseCase(pipelineRepo))
  container.register(DI_TOKENS.CreateStage, new CreateStageUseCase(pipelineRepo))
  container.register(DI_TOKENS.ReorderStages, new ReorderStagesUseCase(pipelineRepo))

  container.register(DI_TOKENS.ListNotes, new ListNotesUseCase(noteRepo))
  container.register(DI_TOKENS.CreateNote, new CreateNoteUseCase(noteRepo))
  container.register(DI_TOKENS.UpdateNote, new UpdateNoteUseCase(noteRepo))
  container.register(DI_TOKENS.DeleteNote, new DeleteNoteUseCase(noteRepo))

  container.register(DI_TOKENS.ListTasks, new ListTasksUseCase(taskRepo))
  container.register(DI_TOKENS.CreateTask, new CreateTaskUseCase(taskRepo))
  container.register(DI_TOKENS.UpdateTask, new UpdateTaskUseCase(taskRepo))
  container.register(DI_TOKENS.DeleteTask, new DeleteTaskUseCase(taskRepo))

  container.register(DI_TOKENS.ListCalls, new ListCallsUseCase(callRepo))
  container.register(DI_TOKENS.CreateCall, new CreateCallUseCase(callRepo))
}
