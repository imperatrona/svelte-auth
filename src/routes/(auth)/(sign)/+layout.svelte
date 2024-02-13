<script lang="ts">
  import { page } from "$app/stores";
  import { spring } from "svelte/motion";

  let handle: string = $page.url.toString().split("/").at(-1) ?? "signin";
  let interactive = false;

  page.subscribe((value) => {
    const path = value.url.toString().split("/").at(-1);

    if (path && path !== handle && (path === "signin" || path === "signup")) {
      handle = path;
    }
  });

  let coords = spring(
    { height: 0, width: 0, top: 0, left: 0 },
    { stiffness: 0.35, damping: 0.65 }
  );

  function onInit(node: HTMLElement) {
    if (node.classList.contains("active")) {
      setActive(node);
    }
  }

  const setAsActive = (e: MouseEvent) => {
    const node = e.target as HTMLElement;
    setActive(node);
  };

  const setActive = (node: HTMLElement) => {
    coords.set(
      {
        height: node.clientHeight,
        width: node.clientWidth,
        top: node.offsetTop,
        left: node.offsetLeft,
      },
      { hard: $coords.height == 0 ? true : false }
    );
    interactive = true;
  };
</script>

{#if !interactive}
  <style>
    .active {
      background-color: rgb(240, 240, 240);
    }
  </style>
{/if}

<div class="tabs">
  <a
    href="/signin"
    class:active={handle === "signin"}
    on:click={setAsActive}
    use:onInit
  >
    Sign in
  </a>
  <a
    href="/signup"
    class:active={handle === "signup"}
    on:click={setAsActive}
    use:onInit
  >
    Sign up
  </a>
  <div
    class="pointer"
    style={`height:${$coords.height}px;width:${$coords.width}px;top:${$coords.top}px;left:${$coords.left}px;`}
  ></div>
</div>

<slot />

<style>
  .tabs {
    padding: 8px;
    border: solid 1px #eaeaea;
    border-radius: 8px;
    display: flex;
  }

  .tabs > a {
    display: block;
    padding: 12px 16px;
    text-decoration: none;
    color: rgb(100, 100, 100);
  }

  .tabs > .active {
    border-radius: 8px;
    color: inherit;
    /* background-color: rgb(240, 240, 240); */
  }
  .pointer {
    position: absolute;
    display: block;
    border-radius: 8px;
    z-index: -1;
    /* background-color: pink; */
    background-color: rgb(240, 240, 240);
  }
</style>
