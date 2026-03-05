<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { setContext } from 'svelte'
  import type { ZodObject } from 'zod'

  let {
    children,
    schema,
    ...restArgs
  }: {
    children: Snippet
    schema?: ZodObject
  } & SvelteHTMLElements['form'] = $props()

  class FormCtx {
    data = $state({})
    set() {}
  }

  const ctx = new FormCtx()
  setContext('form', ctx)

  function onsubmit(evt: Event) {
    evt.preventDefault()
  }
</script>

<form {onsubmit} {...restArgs}>
  {@render children()}
</form>
