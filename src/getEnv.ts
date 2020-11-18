import dotenv from 'dotenv'

dotenv.config()

type ENV_FILE_KEYS = 'USER_POOL_ID' | 'CLIENT_ID' | 'POOL_REGION'

function getEnv(key: ENV_FILE_KEYS) {
  return process.env[key] || ''
}

export default getEnv
