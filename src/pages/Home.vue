<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold mb-8">Gappy Game</h1>
    <input v-model="name" placeholder="Enter your name" class="input input-bordered w-full max-w-xs mb-4" />
    <BaseButton @click="createRoom">Create Room</BaseButton>
    <input v-model="roomId" placeholder="Enter Room ID" class="input input-bordered w-full max-w-xs mt-4 mb-4" />
    <BaseButton @click="joinRoom">Join Room</BaseButton>
    <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createGame, joinGame, myPeer, myPlayerName } from '../store'
import BaseButton from '../components/BaseButton.vue'
import { setPlayerName } from '../useGame'

const name = ref('')
const roomId = ref('')
const router = useRouter()
const errorMessage = ref('')

function createRoom() {
  if (name.value) {
    setPlayerName(name.value)
    createGame()
    myPeer.on('open', () => {
      if (myPeer.id) {
        router.push({ name: 'game-room' })
      }
    })
  }
}

function joinRoom() {
  if (roomId.value && name.value) {
    setPlayerName(name.value)
    joinGame(roomId.value)
    myPeer.on('error', () => {
      errorMessage.value = 'Room not found'
    })
  } else {
    errorMessage.value = 'Please enter your name and room ID'
  }
}
</script>