<script setup>

</script>

<template>
  <router-link to="/">
    <h1>
      <div class="logoInsideSpace">
        <img id="imgLogo" alt="Logo SimonBedardProg" src="../assets/images/LogoSBP.png">
      </div>
      <div id="textForLogo" class="logoInsideSpace">
        imonBedardProg
      </div>
    </h1>
  </router-link>
</template>

<style scoped>
#textForLogo {
  margin-top: 10px;
}

h1 {
  display: flex;
  flex-flow: row;
  justify-content: center;
  font-size: 2rem;
}

#imgLogo {
  width: 100px;
  height: 100px;
}

.logoInsideSpace {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>