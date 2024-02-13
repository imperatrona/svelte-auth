<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/forms/Button.svelte";
  import Input from "$lib/components/forms/Input.svelte";
</script>

<div>
  <h1>Create an account</h1>
  <form method="POST" use:enhance>
    <Input name="email" type="email" />
    <Input name="password" type="password" />
    <Button>Sign Up</Button>
  </form>
</div>
