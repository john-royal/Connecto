import Alert from '@mui/joy/Alert'
import Button from '@mui/joy/Button'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Link from '@mui/joy/Link'
import Typography from '@mui/joy/Typography'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { useAuth } from '../../lib/auth'

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const handleSubmit = (e: React.FormEvent<SignInFormElement>) => {
    e.preventDefault()

    const elements = e.currentTarget.elements

    const email = elements.email.value
    const password = elements.password.value

    setLoading(true)
    setError('')

    signIn(email, password)
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AuthLayout>
      <div>
        <Typography level="h4" component="h1">
          Sign In
        </Typography>
        <Typography
          endDecorator={
            <Link
              component={RouterLink}
              to="/create-account"
              sx={{ color: '#70ACB1' }}
            >
              Create an Account
            </Link>
          }
          fontSize="sm"
          sx={{ alignSelf: 'center' }}
        >
          or
        </Typography>
      </div>

      {error && <Alert color="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            placeholder="johndoe@email.com"
            slotProps={{ input: { 'data-testid': 'email' } }}
          />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="•••••"
            slotProps={{ input: { 'data-testid': 'password' } }}
          />
        </FormControl>
        <Button
          type="submit"
          loading={loading}
          sx={[
            {
              color: 'white',
              borderColor: '#70ACB1',
              backgroundColor: '#83b0a6',
              '&:hover': {
                backgroundColor: '#4e797c'
              },
              '&:active': {
                color: 'white',
                backgroundColor: '#C6F1E7'
              }
            }
          ]}
        >
          Sign In
        </Button>
      </form>
    </AuthLayout>
  )
}
