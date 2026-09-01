import { registerCrmDependencies } from "./register-crm"
import { registerOperationsDependencies } from "./register-operations"

export function registerDependencies() {
  registerCrmDependencies()
  registerOperationsDependencies()
}
