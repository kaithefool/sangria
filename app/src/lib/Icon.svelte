<script lang="ts">
  import {
    icon as faIcon,
    type IconDefinition,
  } from '@fortawesome/fontawesome-svg-core'

  let { icon, class: classes }: {
    icon: IconDefinition
    class?: string | string[]
  } = $props()
  let i = $derived.by(() => faIcon(icon, {
    classes,
    // transform: {}
  })?.html)
</script>

{@html i}