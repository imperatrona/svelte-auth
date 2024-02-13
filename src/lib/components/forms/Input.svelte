<script lang="ts">
  import { capitalize } from "$lib/utils/capitalize";

  export let type: "text" | "password" | "email" = "text";
  export let name: string = type;
  export let label: string | boolean = true;
  export let value = "";

  let activeType = type;
</script>

<div class="input">
  {#if label}
    <label for={name}>{label === true ? capitalize(name) : label}</label>
  {/if}

  <input {...{ type: activeType }} {name} bind:value {...$$restProps} />

  {#if type === "password"}
    <button
      class="toggle-visability"
      on:click={(e) => {
        e.preventDefault();
        activeType = activeType === type ? "text" : type;
      }}
    >
      {activeType === "text" ? "hide" : "show"}
    </button>
  {/if}
</div>

<style>
  .input {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
  }

  .input label {
    font-size: 0.8em;
  }

  .input input {
    padding: 8px;
    font-family: inherit;
  }

  .toggle-visability {
    display: block;
    width: 40px;
    height: 40px;
  }
</style>
