<template>
    <div class="flex flex-col items-center mx-auto text-center p-6 gap-2">
        <input placeholder="Scoreboard" class="w-full font-bold text-4xl text-center bg-transparent">
        <div class="flex flex-row gap-2 items-baseline m-2">
            <button @click="togglePanel" class="bg-gray-800 text-white px-4 py-2 rounded-lg">
                {{ isPanelOpen ? 'Hide' : 'Setting' }}
            </button>
            <button @click="addTeam" class="bg-green-600 text-white px-4 py-2 rounded-lg">Add Team</button>
        </div>
        <!-- Collapsible Panel -->
        <transition name="fade">
            <div v-show="isPanelOpen" class="bg-gray-200 p-6 rounded-lg shadow-lg">
                <h2 class="text-2xl text-black font-bold mb-4">Edit Score</h2>
                <div class="flex flex-col space-y-4">
                    <!-- Dynamic Score Buttons -->
                    <div class="flex space-x-4 justify-center">
                        <input v-model.number="globalScores.score1" type="number"
                            class="bg-green-500 text-xl text-gray-950 p-2 border rounded-lg"
                            placeholder="Score Value" />
                        <input v-model.number="globalScores.score2" type="number"
                            class="bg-blue-500 text-xl text-gray-950 p-2 border rounded-lg" placeholder="Score Value" />
                        <input v-model.number="globalScores.score3" type="number"
                            class="bg-yellow-500 text-xl text-gray-950 p-2 border rounded-lg"
                            placeholder="Score Value" />
                    </div>
                </div>
            </div>
        </transition>

        <!-- Team Panel -->
        <transition-group name="fade" tag="div" class="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
            <div v-for="(team, index) in teams" :key="team.id"
                class="flex flex-col p-4 gap-2 bg-gray-100 rounded-lg shadow">
                <div class="flex flex-row gap-2">
                    <input v-model="team.name" placeholder="Team Name"
                        class="text-2xl text-gray-950 text-center font-semibold p-2 w-full border rounded-lg uppercase" />
                    <button class="bg-red-600 text-white px-4 py-2 rounded-lg" @click="removeTeam(index)">X</button>
                </div>

                <div class="text-3xl text-black font-bold">{{ team.score }}</div>

                <div class="flex flex-wrap justify-center gap-2">
                    <button @click="changeScore(index, globalScores.score1)"
                        class="bg-green-500 text-white px-4 py-2 rounded-lg">{{ globalScores.score1 >= 0 ? '+' : '' }}{{
                            globalScores.score1 }}</button>

                    <button @click="changeScore(index, globalScores.score2)"
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg">{{ globalScores.score2 >= 0 ? '+' : '' }}{{
                            globalScores.score2 }}</button>

                    <button @click="changeScore(index, globalScores.score3)"
                        class="bg-yellow-500 text-white px-4 py-2 rounded-lg">{{ globalScores.score3 >= 0 ? '+' : ''
                        }}{{ globalScores.score3 }}</button>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script>
export default {
    data() {
        return {
            teams: [],
            globalScores: {
                score1: 100,
                score2: -100,
                score3: 50
            },
            isPanelOpen: true,
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
        },
        togglePanel() {
            this.isPanelOpen = !this.isPanelOpen;  // Toggle panel visibility
        },
    }
};
</script>

<style scoped>
/* Tailwind CSS animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
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