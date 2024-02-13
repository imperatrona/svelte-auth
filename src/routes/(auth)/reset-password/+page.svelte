<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/forms/Button.svelte";
  import Input from "$lib/components/forms/Input.svelte";
  import type { ActionData, PageData } from "./$types";

  export let form: ActionData;
  export let data: PageData;
</script>

<div>
  {#if !data.code}
    <h1>Reset password</h1>
    <form method="POST" use:enhance action="?/requestReset">
      <Input type="email" required={true} />
      <Button value="Request reset password link" />
    </form>
  {:else}
    <h1>Set new password</h1>
    <form use:enhance method="post" action="?/verifyReset">
      <input type="hidden" name="code" value={data.code} />
      <Input type="password" minlength={4} required={true} />
      <input type="submit" value="Send verification email" />
    </form>
  {/if}

  {#if form?.error}
    {form.error}
  {/if}
  {#if form?.errors && form?.errors?.length > 0}
    {form.errors[0].message}
  {/if}
</div>
