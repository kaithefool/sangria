<script>
  import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons/faArrowRightToBracket'
  import Centered from '$lib/Centered.svelte'
  import Icon from '$lib/Icon.svelte'
  import Field from '$lib/form/Field.svelte'
  import Form from '$lib/form/Form.svelte'
  import * as z from 'zod'

  const schema = z.object({
    email: z.email(),
    password: z.string().min(8),
  })
</script>

<div class="vh-100">
  <Centered class="p-5">
    <Form {schema}>
      <Field name="email" />
      <Field name="password" />
      <button type="submit" class="btn btn-primary">
        <Icon icon={faArrowRightToBracket} />
        Login
      </button>
    </Form>
  </Centered>
</div>
