<template>
    <div :class="['flex flex-col items-center mx-auto text-center p-4 gap-2 h-screen relative', backgroundColorClass]">
        <input placeholder="Scoreboard" class="w-full font-bold text-4xl text-center text-pretty bg-transparent">
        <div class="flex flex-row gap-2 items-baseline m-2">
            <button @click="togglePanel" class="bg-gray-800 text-white px-4 py-2 rounded-lg">
                Setting
            </button>
            <button @click="addTeam"
                class="bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-100 hover:scale-105 active:scale-105">Add
                Team</button>
            <div v-if="!isCountingDown" class="flex gap-2 items-end">
                <input v-model.number="minutes" type="number" min="0" placeholder="Minutes"
                    class="w-20 text-black text-end p-2 border rounded-lg">
                <span>m</span>
                <input v-model.number="seconds" type="number" min="0" placeholder="Seconds"
                    class="w-20 text-black text-end p-2 border rounded-lg">
                <span>s</span>
                <button @click="startCountdown" class="bg-green-600 text-white px-4 py-2 rounded-lg">Timer</button>
            </div>
        </div>
        <!-- Collapsible Panel -->
        <transition name="fade" class="absolute self-start">
            <div v-show="isPanelOpen" class="flex flex-col bg-gray-200 p-8 gap-2 rounded-lg shadow-lg">
                <div class="flex flex-row gap-2 justify-end items-baseline">
                    <h2 class="text-5xl text-black font-bold mb-4 w-full">Setting</h2>
                    <button @click="togglePanel" class="absolute bg-gray-800 text-white px-3 py-2 rounded-lg">
                        &#10006;
                    </button>
                </div>
                <div class="flex flex-col gap-2">
                    <span class="text-black font-bold">Set Score Button (0 to hide)</span>
                    <div class="flex flex-wrap gap-4 justify-center w-auto">
                        <input v-model.number="globalScores.score1" type="number"
                            class="bg-green-500 text-xl text-white font-bold text-center p-2 max-w-32 rounded-lg"
                            placeholder="Score Value" />
                        <input v-model.number="globalScores.score2" type="number"
                            class="bg-blue-500 text-xl text-white font-bold text-center p-2 max-w-32 rounded-lg"
                            placeholder="Score Value" />
                        <input v-model.number="globalScores.score3" type="number"
                            class="bg-yellow-500 text-xl text-white font-bold text-center p-2 max-w-32 rounded-lg"
                            placeholder="Score Value" />
                    </div>
                </div>
                <button @click="resetAll" class="bg-red-600 text-white text-center p-2 rounded-lg w-auto">Clear
                    All Teams</button>
            </div>
        </transition>

        <!-- Countdown Input and Overlay -->
        <div v-if="isCountingDown"
            class="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center gap-4">
            <div class="text-white text-9xl font-bold animate-pulse">
                {{ formattedCountdown }}
            </div>
            <button @click="resetCountdown" class="bg-red-600 text-white px-4 py-2 rounded-lg">Reset</button>
        </div>

        <!-- Team Panel -->
        <transition-group name="fade" tag="div" mode="out-in"
            :class="['grid gap-4 w-full h-4/6 flex-1 px-8 pb-8', teamGridClass]">
            <div v-for="(team, index) in teams" :key="team.id" :class="[
                'flex flex-col p-4 gap-2 rounded-lg shadow transition-all duration-300',
                team.lastChange > 0 ? 'bg-green-500 scale-110' : team.lastChange < 0 ? 'bg-red-500 scale-90' : 'bg-gray-100'
            ]">
                <div class="flex flex-row gap-2">
                    <input v-model="team.name" placeholder="Team Name"
                        class="text-2xl text-gray-950 text-center font-bold p-2 w-full border rounded-lg uppercase transition-all duration-100" />
                    <button class="bg-red-600 text-white px-4 rounded-lg transition-all duration-100 hover:scale-105"
                        @click="removeTeam(index)">&#10006;</button>
                </div>

                <div class="flex flex-row flex-1 justify-between">
                    <transition name="bounce" mode="out-in">
                        <div :key="team.score"
                            :class="['text-black font-bold subpixel-antialiased flex-1 flex items-center justify-center', scoreClass]">
                            {{ team.score }}
                        </div>
                    </transition>

                    <div class="flex flex-col justify-center gap-2">
                        <button v-if="globalScores.score1 !== 0" @click="changeScore(index, globalScores.score1)"
                            class="bg-green-500 text-white font-bold px-2 py-1 rounded-lg transition-all duration-100 hover:scale-105">{{
                                globalScores.score1 >= 0 ?
                                    '+' : ''
                            }}{{
                                globalScores.score1 }}</button>

                        <button v-if="globalScores.score2 !== 0" @click="changeScore(index, globalScores.score2)"
                            class="bg-blue-500 text-white font-bold px-2 py-1 rounded-lg transition-all duration-100 hover:scale-105">{{
                                globalScores.score2 >= 0 ?
                                    '+' : ''
                            }}{{
                                globalScores.score2 }}</button>

                        <button v-if="globalScores.score3 !== 0" @click="changeScore(index, globalScores.score3)"
                            class="bg-yellow-500 text-white font-bold px-2 py-1 rounded-lg transition-all duration-100 hover:scale-105">{{
                                globalScores.score3 >= 0
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
                score2: -50,
                score3: 50
            },
            isPanelOpen: true,
            lastChange: 0,
            minutes: 0,
            seconds: 5,
            originalMinutes: 0,
            originalSeconds: 0,
            isCountingDown: false,
            countdown: null,
            backgroundColorClass: '', // For background highlighting
            alarm: new Audio('buzz.wav'),
            tick: new Audio('tick.wav'),
        };
    },
    computed: {
        formattedCountdown() {
            const minutes = String(this.minutes).padStart(2, '0');
            const seconds = String(this.seconds).padStart(2, '0');
            return `${minutes}:${seconds}`;
        },
        teamGridClass() {
            const teamCount = this.teams.length;
            if (teamCount < 2) return 'grid-cols-1';
            if (teamCount <= 4) return 'grid-cols-2';
            if (teamCount <= 6) return 'grid-cols-3';
            return 'grid-cols-4';
        },
        scoreClass() {
            const teamCount = this.teams.length;
            if (teamCount <= 6) return 'text-8xl';
            return 'text-6xl';
        },
        scoreboardBackgroundClass() {
            if (this.lastChange > 0) {
                return 'bg-green-200';
            } else if (this.lastChange < 0) {
                return 'bg-red-200';
            } else {
                return 'bg-white';
            }
        },
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
        highlightBackground(colorClass) {
            this.backgroundColorClass = colorClass + ' bg-transition';
            setTimeout(() => {
                this.backgroundColorClass = 'bg-transition';
            }, 500);
        },
        startCountdown() {
            if (!this.minutes) {
                this.minutes = 0;
            }
            if (!this.seconds) {
                this.seconds = 0;
            }
            if (this.minutes === 0 && this.seconds === 0) {
                return;
            }

            this.originalMinutes = this.minutes;
            this.originalSeconds = this.seconds;
            this.isCountingDown = true;
            this.tick.play();
            this.countdown = setInterval(() => {
                if (this.seconds === 1 && this.minutes === 0) {
                    this.alarm.play();
                    this.resetCountdown();
                    this.highlightBackground('bg-red-500'); // Highlight background when countdown ends
                } else {
                    this.tick.currentTime = 0;
                    this.tick.play();
                    if (this.seconds === 0) {
                        this.minutes--;
                        this.seconds = 59;
                    } else {
                        this.seconds--;
                    }
                }
            }, 1000);
        },
        resetCountdown() {
            clearInterval(this.countdown);
            this.isCountingDown = false;
            this.minutes = this.originalMinutes;
            this.seconds = this.originalSeconds;
        },
        resetAll() {
            clearInterval(this.countdown);
            this.isCountingDown = false;
            this.minutes = 0;
            this.seconds = 5;
            this.teams = [];
        }
    }
};
</script>

<style scoped>
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

.bg-transition {
    transition: background-color 0.5s ease;
}

/* Countdown animation */
.animate-pulse {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    10% {
        transform: scale(2);
    }

    100% {
        transform: scale(1);
    }
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
