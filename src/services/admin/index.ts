export * from './accessService'

import { authService, loginAuditService, permissionsService, usersService } from './accessService'

export const adminServices = {
    access: {
        auth: authService,
        users: usersService,
        permissions: permissionsService,
        loginAudit: loginAuditService,
    },
}
