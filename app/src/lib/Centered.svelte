<script>
  let { children } = $props()
</script>

<div class="d-flex align-items-center h-100">
  <div class="container">
    {@render children()}
  </div>
</div>