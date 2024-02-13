<script lang="ts">
  export let href: string = "";
  export let type: "input" | "button" | "link" = "button";
  export let value: string = "";
</script>

{#if href !== "" || type === "link"}
  <a {href} class="button" on:click>
    {#if value}
      {value}
    {:else}
      <slot />
    {/if}
  </a>
{:else if type === "input"}
  <input type="submit" class="button" on:click {value} />
{:else}
  <button class="button" on:click>
    {#if value}
      {value}
    {:else}
      <slot />
    {/if}
  </button>
{/if}

<style>
  .button {
    border: 0;
    padding: 8px 16px;
    margin: 0;
    background: none;
    font-family: inherit;
    font-size: inherit;

    position: relative;
    display: inline-flex;
    background-color: rgb(227, 227, 227);

    text-decoration: none;
    color: inherit;
  }

  .button:hover {
    background-color: rgb(217, 217, 217);
  }
  .button:active {
    background-color: rgb(237, 237, 237);
  }
  .button::before,
  .button::after {
    content: "";
    position: absolute;
    inset: 0;
    /* user-select: none; */
    pointer-events: none;

    background-image: url("/border.svg");
    background-position: 0;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .button::after {
    transform: scaleX(-1);
  }
</style>
