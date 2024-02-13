<script lang="ts">
  import { page } from "$app/stores";
</script>

<h1>Custom error</h1>
<h1>{$page.status}: {$page.error?.message}</h1>
