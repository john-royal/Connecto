import cors from 'cors'
import { json, Router, type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import * as authController from './controllers/auth'
import * as helpersController from './controllers/helpers'
import * as threadsController from './controllers/threads'
import { helpers, session } from './lib/session'

const router = Router()

if (process.env.NODE_ENV !== 'test') {
  router.use(morgan('dev'))
}
router.use(json())
router.use(session, helpers)
router.use(helmet())
router.use(cors())

router.get('/', (req, res) => res.send('Hello, world!'))

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.get('/auth/session', authController.session)
router.get('/auth/logout', authController.logout)

router.use('/threads', threadsController.enforceAuth)
router.get('/threads', threadsController.findAll)
router.post('/threads', threadsController.create)
router.get('/threads/:id', threadsController.findOne)

router.get('/location', helpersController.geocode)
router.post('/attachment', helpersController.upload)

router.use(((error, req, res, next) => {
  console.error(error)
  res.status(500).send({ error })
}) as ErrorRequestHandler)

export default router
