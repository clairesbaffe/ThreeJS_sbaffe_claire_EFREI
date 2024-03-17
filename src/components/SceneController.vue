<template>
  <div class="optionsContainer">
    <button @click="zoomInOrOut(true)">Zoom In</button>
    <button @click="zoomInOrOut(false)">Zoom Out</button>
    <button @click="resetCamera()">Reset Camera</button>
    <button @click="resetGame()">Reset Game</button>
    <div class="checkboxContainer">
      <label for="debugCheckbox">Debug</label>
      <input type="checkbox" checked id="debugCheckbox" @change="addOrRemoveDebugElements($event.target.checked)">
    </div>

  </div>
</template>

<script>

import {resetCamera, zoomInOrOut, setInDebug, resetGame} from '@/ThreeJS/BasicAndMouse.js';

export default {
  methods: {resetGame, resetCamera, zoomInOrOut, addOrRemoveDebugElements: setInDebug}
}

</script>

<style scoped>

</style>