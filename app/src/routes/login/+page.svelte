<script>
  import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons/faArrowRightToBracket'
	import Centered from "$lib/Centered.svelte";
	import Icon from '$lib/Icon.svelte';
</script>

<Centered>
  <form>
    <div class="m-3">
      <input
        name="username"
        type="email"
        class="form-control"
      />
    </div>
    <button
      type="submit"
      class="btn btn-primary"
    >
      <Icon icon={faArrowRightToBracket} />
      Login
    </button>
  </form>
</Centered>