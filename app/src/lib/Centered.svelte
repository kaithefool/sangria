<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'

  let {
    children,
    class: classes,
    ...rest
  }: {
    children: Snippet
  } & SvelteHTMLElements['div'] = $props()
</script>

<div class="d-flex align-items-center h-100">
  <div class={['mx-auto mw-100', classes]} style:width="var(--width, 500px)" {...rest}>
    {@render children()}
  </div>
</div>
