<template>
    <div class="max-w-3xl mx-auto text-center p-6">
      <h1 class="text-4xl font-bold mb-8">Scoreboard</h1>
  
      <!-- Editable Global Score Buttons -->
      <div class="mb-8">
        <div class="flex space-x-4 justify-center">
          <input v-model.number="globalScores.score1" placeholder="Score 1" type="number" class="text-xl w-24 p-2 border rounded-lg" />
          <input v-model.number="globalScores.score2" placeholder="Score 2" type="number" class="text-xl w-24 p-2 border rounded-lg" />
          <input v-model.number="globalScores.score3" placeholder="Score 3" type="number" class="text-xl w-24 p-2 border rounded-lg" />
        </div>
      </div>
  
      <transition-group name="fade" tag="div">
        <div v-for="(team, index) in teams" :key="team.id" class="flex items-center justify-between mb-4 p-4 bg-gray-100 rounded-lg shadow">
          <input v-model="team.name" placeholder="Team Name" class="text-2xl font-semibold p-2 w-2/5 border rounded-lg"/>
          <transition name="bounce">
            <div class="text-3xl font-bold flex-1">{{ team.score }}</div>
          </transition>
          <div class="flex space-x-2">
            <button @click="changeScore(index, globalScores.score1)" class="bg-green-500 text-white px-4 py-2 rounded-lg">{{ globalScores.score1 >= 0 ? '+' : '' }}{{ globalScores.score1 }}</button>
  
            <button @click="changeScore(index, globalScores.score2)" class="bg-blue-500 text-white px-4 py-2 rounded-lg">{{ globalScores.score2 >= 0 ? '+' : '' }}{{ globalScores.score2 }}</button>
  
            <button @click="changeScore(index, globalScores.score3)" class="bg-yellow-500 text-white px-4 py-2 rounded-lg">{{ globalScores.score3 >= 0 ? '+' : '' }}{{ globalScores.score3 }}</button>
          </div>
          <button class="bg-red-600 text-white px-4 py-2 ml-4 rounded-lg" @click="removeTeam(index)">Remove</button>
        </div>
      </transition-group>
      <button @click="addTeam" class="bg-green-600 text-white px-6 py-3 mt-6 rounded-lg">Add Team</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        teams: [],
        globalScores: {
          score1: 1,
          score2: 2,
          score3: 3
        }
      };
    },
    methods: {
      addTeam() {
        this.teams.push({ id: Date.now(), name: '', score: 0 });
      },
      removeTeam(index) {
        this.teams.splice(index, 1);
      },
      changeScore(index, amount) {
        this.teams[index].score += amount;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Tailwind CSS animations */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  
  .bounce-enter-active {
    animation: bounce-in 0.5s;
  }
  .bounce-leave-active {
    animation: bounce-out 0.5s;
  }
  
  @keyframes bounce-in {
    0% {
      transform: scale(0.5);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes bounce-out {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(0.5);
      opacity: 0;
    }
  }
  </style>
  