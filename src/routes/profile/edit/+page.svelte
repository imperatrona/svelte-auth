<script lang="ts">
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;
</script>

<h1>edit profile</h1>
<a href="/profile">back</a>

<form>
  <label for="email">email</label>
  <input type="text" value={form?.email ?? data.user.email} />
</form>
