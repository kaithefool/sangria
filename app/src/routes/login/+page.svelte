<script>
	import Centered from "$lib/Centered.svelte";
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
      Login
    </button>
  </form>
</Centered>