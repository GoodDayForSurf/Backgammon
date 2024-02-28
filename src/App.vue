<script setup>
import { computed, reactive, ref } from 'vue';

</script>

<template>
  <div class="board">
      <div class="board-inner">
        <div v-for="i in [0,1,2,3,4,5,6,7,8,9,10,11]"
             class="chip-place"
             :style="{left: `calc(${i}  * 100vh / 12)`}"></div>
        <div style="position: relative; top: 100vh; transform: rotate(180deg);">
          <div v-for="i in [0,1,2,3,4,5,6,7,8,9,10,11]"
               class="chip-place"
               :style="{left: `calc(${i}  * 100vh / 12)`}"></div>
        </div>
        <div v-for="i in [0,1,2,3,4,5,6,7,8,9,10,11]"
             class="chip"
             :style="{top: `calc(0.4 * ${i}  * 100vh / 12)`}"
        ></div>
      </div>
      <div class="board-middle"></div>
  </div>
</template>
<style src="./App.scss" lang="scss"></style>
