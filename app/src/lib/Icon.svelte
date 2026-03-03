<script lang="ts">
  import {
    icon as faIcon,
    type IconDefinition,
    type IconParams,
  } from '@fortawesome/fontawesome-svg-core'

  let { icon, class: classes, ...args }: {
    icon: IconDefinition
    class?: IconParams['classes']
  } & Omit<IconParams, 'classes'> = $props()
  let i = $derived.by(() => faIcon(icon, {
    classes,
    ...args
  })?.html)
</script>

{@html i}