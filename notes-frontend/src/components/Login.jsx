import PropTypes from "prop-types"
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Paper,
  Title,
  Container,
  Group,
  Button,
} from "@mantine/core"
import classes from "./Login.module.css"

const LoginForm = ({
  handleSubmit,
  handleUsernameChange,
  handlePasswordChange,
  username,
  password,
}) => {
  return (
    <Container size={420} my={40}>
      <Title align="center" className={classes.title}>
        Welcome!
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            placeholder="admin"
            value={username}
            onChange={handleUsernameChange}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="admin"
            value={password}
            onChange={handlePasswordChange}
            required
            mt="md"
          />

          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

// Prop validation
LoginForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleUsernameChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
}

export default LoginForm
