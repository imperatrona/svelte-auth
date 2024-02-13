<script>
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/forms/Button.svelte";
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a>
  to read the documentation
</p>
<Button href="/profile">Profile</Button>
<Button
  on:click={() => {
    toast.success(`💖 Love on the way`, {
      position: "bottom-right",
    });
  }}
>
  Send Love💖
</Button>
