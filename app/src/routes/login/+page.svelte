<script>
  import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons/faArrowRightToBracket'
	import Centered from "$lib/Centered.svelte"
	import Icon from '$lib/Icon.svelte'
	import Field from '$lib/Field.svelte';
</script>

<div class="vh-100">
  <Centered class="p-5">
    <form>
      <Field name="email" />
      <Field name="password" />
      <button
        type="submit"
        class="btn btn-primary"
      >
        <Icon icon={faArrowRightToBracket} />
        Login
      </button>
    </form>
  </Centered>
</div>