import { Router } from 'express'
import { sessionRouter } from './session'
import { userRouter } from './user'
import { accountRouter } from './account'
import { businessRouter } from './business'
import { workspaceRouter } from './workspace'
import { appRouter } from './app'
import { dealRouter } from './deal'
import { activitylogRouter } from './activitylog'

const routerV1 = Router()

routerV1.use('/session', sessionRouter)
routerV1.use('/user', userRouter)
routerV1.use('/account', accountRouter)
routerV1.use('/business', businessRouter)
routerV1.use('/workspace', workspaceRouter)
routerV1.use('/app', appRouter)
routerV1.use('/deal', dealRouter)
routerV1.use('/activitylog', activitylogRouter)

export { routerV1 }