<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold mb-8">Gappy Game</h1>
    <input v-model="name" placeholder="Enter your name" class="input input-bordered w-full max-w-xs mb-4" />
    <BaseButton @click="createRoom">Create Room</BaseButton>
    <input v-model="roomId" placeholder="Enter Room ID" class="input input-bordered w-full max-w-xs mt-4 mb-4" />
    <BaseButton @click="joinRoom">Join Room</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createGame, connect, myPeer } from '../store'
import BaseButton from '../components/BaseButton.vue'
import { setPlayerName } from '../useGame'

const name = ref('')
const roomId = ref('')
const router = useRouter()

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
    connect(roomId.value)
    router.push({ name: 'game-room' })
  }
}
</script>