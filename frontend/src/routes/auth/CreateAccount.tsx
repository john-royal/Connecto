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
  name: HTMLInputElement
  email: HTMLInputElement
  phone: HTMLInputElement
  password: HTMLInputElement
}

interface CreateAccountFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

export default function CreateAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { createAccount } = useAuth()

  const handleSubmit = (e: React.FormEvent<CreateAccountFormElement>) => {
    e.preventDefault()

    const elements = e.currentTarget.elements

    const name = elements.name.value
    const email = elements.email.value
    const phone = elements.phone.value
    const password = elements.password.value

    setLoading(true)
    setError('')

    createAccount({ name, email, phone, password })
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
          Create Account
        </Typography>
        <Typography
          endDecorator={
            <Link
              component={RouterLink}
              to="/sign-in"
              sx={{ color: '#70ACB1' }}
            >
              Sign In
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
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            type="text"
            placeholder="Jane Doe"
            slotProps={{ input: { 'data-testid': 'name' } }}
            required
          />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            placeholder="janedoe@email.com"
            slotProps={{ input: { 'data-testid': 'email' } }}
            required
          />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Phone Number</FormLabel>
          <Input
            name="phone"
            type="tel"
            placeholder="+1 (877) 393-4448"
            slotProps={{ input: { 'data-testid': 'phone' } }}
            required
          />
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="•••••"
            slotProps={{ input: { 'data-testid': 'password' } }}
            required
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
          Create Account
        </Button>
      </form>
    </AuthLayout>
  )
}
