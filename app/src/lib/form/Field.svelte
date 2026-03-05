<script lang="ts">
  import { v4 as uuid } from 'uuid'
  import { titleCase } from '../utils.ts'
  import { getContext } from 'svelte'

  const formCtx = getContext('form')
  let {
    name,
  }: {
    name: string
  } = $props()
  let id = $state(uuid())
</script>

<div class="mb-3">
  <label for={id} class="form-label">
    {titleCase(name)}
  </label>
  <input {id} type="text" {name} class="form-control" />
</div>
