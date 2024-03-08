<script>
</script>
<template>
  <div class="win-container">
    <div class="black"> </div>
    <div class="white"> </div>
  </div>
</template>

<style scoped lang="scss">
.win-container {
  content:  '★';
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20vh;
  width: var(--board-width);
  max-width: var(--board-width);
  z-index: 1;

  .white,
  .black {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 22vh;
      height: 22vh;
    }
    background: transparent no-repeat center;
    background-image: url("@/assets/star.svg");
    background-size: contain;
    height: 20vh;

    &.animate {
      animation: rotate 3s linear 1;
    }
  }

  .white {
    filter: invert(0.9);
  }

}
</style>
