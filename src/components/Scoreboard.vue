<template>
    <div class="flex flex-col items-center mx-auto text-center p-4 gap-2 h-screen">
        <input placeholder="Scoreboard" class="w-full font-bold text-4xl text-center text-pretty bg-transparent">
        <div class="flex flex-row gap-2 items-baseline m-2">
            <button @click="togglePanel" class="bg-gray-800 text-white px-4 py-2 rounded-lg">
                {{ isPanelOpen ? 'Hide' : 'Setting' }}
            </button>
            <button @click="addTeam" class="bg-green-600 text-white px-4 py-2 rounded-lg">Add Team</button>
        </div>
        <!-- Collapsible Panel -->
        <transition name="fade">
            <div v-show="isPanelOpen" class="bg-gray-200 p-6 rounded-lg shadow-lg w-full">
                <h2 class="text-2xl text-black font-bold mb-4">Edit Score</h2>
                <div class="flex flex-col space-y-4">
                    <!-- Dynamic Score Buttons -->
                    <div class="flex flex-wrap gap-4 justify-center">
                        <input v-model.number="globalScores.score1" type="number"
                            class="bg-green-500 text-xl text-white text-center p-2 border rounded-lg"
                            placeholder="Score Value" />
                        <input v-model.number="globalScores.score2" type="number"
                            class="bg-blue-500 text-xl text-white text-center p-2 border rounded-lg"
                            placeholder="Score Value" />
                        <input v-model.number="globalScores.score3" type="number"
                            class="bg-yellow-500 text-xl text-white text-center p-2 border rounded-lg"
                            placeholder="Score Value" />
                    </div>
                </div>
            </div>
        </transition>

        <!-- Team Panel -->
        <transition-group name="fade" tag="div" mode="out-in"
            :class="['grid gap-4 w-full h-4/6 flex-1 px-8 pb-8', teamGridClass]">
            <div v-for="(team, index) in teams" :key="team.id" :class="[
                'flex flex-col p-4 gap-2 rounded-lg shadow transition-all duration-300',
                team.lastChange > 0 ? 'bg-green-500 scale-110' : team.lastChange < 0 ? 'bg-red-500 scale-90' : 'bg-gray-100'
            ]">
                <div class="flex flex-row gap-2">
                    <input v-model="team.name" placeholder="Team Name"
                        class="text-2xl text-gray-950 text-center font-semibold p-2 w-full border rounded-lg uppercase" />
                    <button class="bg-red-600 text-white px-4 py-2 rounded-lg" @click="removeTeam(index)">X</button>
                </div>

                <div class="flex flex-row flex-1 justify-between">
                    <transition name="bounce" mode="out-in">
                        <div :key="team.score"
                            :class="['text-black font-bold flex-1 flex items-center justify-center', scoreClass]">
                            {{ team.score }}
                        </div>
                    </transition>

                    <div class="flex flex-col justify-center gap-2">
                        <button @click="changeScore(index, globalScores.score1)"
                            class="bg-green-500 text-white font-bold px-4 py-2 rounded-lg">{{ globalScores.score1 >= 0 ?
                                '+' : ''
                            }}{{
                                globalScores.score1 }}</button>

                        <button @click="changeScore(index, globalScores.score2)"
                            class="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg">{{ globalScores.score2 >= 0 ?
                                '+' : ''
                            }}{{
                                globalScores.score2 }}</button>

                        <button @click="changeScore(index, globalScores.score3)"
                            class="bg-yellow-500 text-white font-bold px-4 py-2 rounded-lg">{{ globalScores.score3 >= 0
                                ?
                                '+' : ''
                            }}{{ globalScores.score3 }}</button>
                    </div>
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
    computed: {
        teamGridClass() {
            const teamCount = this.teams.length;
            if (teamCount <= 2) return 'grid-cols-1';
            if (teamCount <= 4) return 'grid-cols-2';
            if (teamCount <= 6) return 'grid-cols-3';
            return 'grid-cols-4';
        },
        scoreClass() {
            const teamCount = this.teams.length;
            if (teamCount <= 6) return 'text-8xl';
            return 'text-6xl';
        }
    },
    methods: {
        addTeam() {
            this.teams.push({ id: Date.now(), name: '', score: 0, lastChange: 0 });
        },
        removeTeam(index) {
            this.teams.splice(index, 1);
        },
        changeScore(index, amount) {
            this.teams[index].lastChange = amount;
            this.teams[index].score += amount;
            setTimeout(() => {
                this.teams[index].lastChange = 0;
            }, 300);  // Reset the highlight after 1 second
        },
        togglePanel() {
            this.isPanelOpen = !this.isPanelOpen;  // Toggle panel visibility
        },
    }
};
</script>

<style scoped>
/* Tailwind CSS animations */
.fade-enter-active {
    transition: opacity 0.5s ease;
}

.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.bounce-enter-active {
    animation: bounce-in 0.5s;
}

.bounce-leave-active {
    animation: bounce-out 0.1s;
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

    100% {
        transform: scale(0.5);
        opacity: 0;
    }
}
</style>
