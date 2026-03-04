<script lang="ts">
  import { v4 as uuid } from 'uuid'

  let { name }: {
    name: string
  } = $props()
  let id = $state(uuid())
</script>

<div class="mb-3">
  <label for={id} class="form-label">
    {name}
  </label>
  <input
    type="text"
    name={name}
    class="form-control"
  />
</div>