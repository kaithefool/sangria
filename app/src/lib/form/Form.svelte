<script lang="ts">
  import { type Snippet } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import type { ZodObject } from 'zod'
  import { SvelteSet } from 'svelte/reactivity'
  import { get, set } from './dotPath.ts'
  import { setFormContext } from './context.ts'

  let {
    children,
    schema,
    ...restProps
  }: {
    children: Snippet
    schema?: ZodObject
  } & SvelteHTMLElements['form'] = $props()

  let data = $state({})
  let dirty = new SvelteSet<string>()
  let validation = $derived(schema?.safeParse(data))

  setFormContext({
    data,
    dirty,
    get validation() {
      return validation
    },
    get(key) {
      return get(data, key)
    },
    set(key: string, value: unknown) {
      set(data, key, value)
    },
  })

  function onsubmit(evt: Event) {
    evt.preventDefault()
  }
</script>

<form {onsubmit} {...restProps}>
  {@render children()}
</form>
