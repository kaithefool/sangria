<script lang="ts">
  import { v4 as uuid } from 'uuid'
  import { titleCase } from '../utils.ts'
  import { getFormContext } from './context.ts'

  const ctx = getFormContext()
  let {
    name,
  }: {
    name: string
  } = $props()
  let id = $state(uuid())
  let issues = $derived(ctx.validation?.error?.issues?.filter((i) => i.path.includes(name)) ?? [])
  let dirty = $derived(ctx.dirty.has(name))
  let showErr = $derived(issues.length && dirty)
</script>

<div class="mb-3">
  <label for={id} class="form-label">
    {titleCase(name)}
  </label>
  <input
    {id}
    {name}
    bind:value={() => ctx.get(name), (v) => ctx.set(name, v)}
    onblur={() => ctx.dirty.add(name)}
    type="text"
    class={['form-control', { 'is-invalid': showErr }]}
  />
  {#if showErr}
    <div class="invalid-feedback">{issues[0].message}</div>
  {/if}
</div>
