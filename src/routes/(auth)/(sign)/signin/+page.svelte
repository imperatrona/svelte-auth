<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/forms/Button.svelte";
  import Input from "$lib/components/forms/Input.svelte";
  import InputError from "$lib/components/forms/InputError.svelte";
  import type { ActionData } from "./$types";

  export let form: ActionData;
</script>

<div>
  <h1>Sign in</h1>
  <form method="POST" use:enhance>
    <Input name="email" type="email" />
    <InputError field="email" errors={form?.errors ?? []} />
    <Input name="password" type="password" />
    <InputError field="password" errors={form?.errors ?? []} />
    {#if form?.message}
      <span class="error">{form.message}</span>
    {/if}
    <Button>Signin</Button>
    <a href="/reset-password">Reset password</a>
  </form>

  <a href="/signin/github">GitHub</a>
  <a href="/signin/tumblr">Tumblr</a>
</div>
