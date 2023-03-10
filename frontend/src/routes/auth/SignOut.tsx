import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingView from '../../components/LoadingView'
import { useAuth } from '../../lib/auth'

function SignOut() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    void signOut().then(() => {
      navigate('/sign-in')
    })
  })

  return <LoadingView />
}

export default SignOut
