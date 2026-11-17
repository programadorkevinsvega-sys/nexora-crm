import { SetMetadata } from '@nestjs/common'

export const REQUIRED_SCOPE_KEY = 'required_scope'
export const RequireScope = (scope: string) => SetMetadata(REQUIRED_SCOPE_KEY, scope)
