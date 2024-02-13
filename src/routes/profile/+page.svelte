<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/forms/Button.svelte";
  import type { ActionData, PageData } from "./$types";

  import { toast } from "svelte-sonner";

  export let data: PageData;
  export let form: ActionData;
  $: if (form?.success)
    toast.success(`Verification code was sent to ${form.email}`, {
      position: "bottom-right",
    });
</script>

<h1>Profile</h1>

<div>
  <p>User id: {data.user.id}</p>
  <p>Email: {data.user.email}</p>

  <p>
    Password set: <input type="checkbox" disabled checked={data.hasPassword} />
  </p>

  {#if !data.hasPassword}
    <Button>Set password</Button>
  {/if}

  <p>
    Verified: <input
      type="checkbox"
      disabled
      checked={data.user.emailVerified}
    />
  </p>
  {#if !data.user.emailVerified}
    {#if form?.success && form.email}
      <p>Verification code was sent to {form.email}</p>
    {:else}
      <form use:enhance method="post" action="?/sendVerificationEmail">
        <input type="submit" value="Send verification email" />
      </form>
    {/if}
  {/if}
</div>
<form use:enhance method="post" action="?/signout">
  <Button>Sign out</Button>
</form>
