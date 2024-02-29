<script setup>
import { computed, reactive, ref } from 'vue';
import chip from './components/chip.vue'

</script>

<template>
  <div class="board">
    <div class="board-inner">
      <div v-for="(_, i) in Array.from({ length: 12 })"
           class="chip-place"
           :style="{left: `calc(${i}  * 100vh / 12)`}"></div>
      <div style="position: relative; top: 100vh; transform: rotate(180deg);">
        <div v-for="(_, i) in Array.from({ length: 12 })"
             class="chip-place"
             :style="{left: `calc(${i}  * 100vh / 12)`}"></div>
      </div>
      <template v-for="(_, i) in Array.from({ length: 15 })">
        <chip :color="'black'" :position="1" :style="{'margin-bottom': `calc(0.4 * ${i}  * 100vh / 12)`}" />
        ></template>
      <template v-for="(_, i) in Array.from({ length: 13 })">
        <chip :color="'white'" :position="1" :style="{'margin-top': `calc(${i} * 0.4 * 100vh / 12)`}" />
      </template>
      <chip :color="'white'" :position="12" />
      <chip :color="'white'" :position="14" />
      <chip :color="'white'" :position="24" />
      <chip :color="'black'" :position="3" />
      <chip :color="'black'" :position="22" />
    </div>
      <div class="board-middle"></div>
  </div>
</template>
<style src="./App.scss" lang="scss"></style>
