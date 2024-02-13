<script lang="ts">
  import type { InputError } from "$lib/validation/errors";
  export let errors: InputError[];
  export let field: string;

  let error: InputError | undefined;

  $: error = errors.find((item) => item.field === field);
</script>

{#if error}
  <span class="error">{error.message}</span>
{/if}

<style>
  .error {
    color: brown;
  }
</style>
