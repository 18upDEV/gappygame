<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import { broadcastPeers, gameAnswer, gameStatus, myPeer, myPlayerIndex, players, quitGame, roomLeaderConn, sendDataToRoomLeader, sendGameDataToPeer } from '../store'
import { thAnswers } from '../answer/th'
import type { GamePlayer } from '../model'

const router = useRouter()

watch(gameStatus, () => {
  if (gameStatus.value === 'gameStart')
    router.push({ name: 'in-game' })
})

const arePlayersExceedMinimum = computed(() => players.value.length >= 4)

const canStartGame = computed(
  () => arePlayersExceedMinimum.value && players.value.every(
    player => player.isRoomLeader || player.isReady,
  ),
)

const startGameButtonText = computed(() => {
  if (!arePlayersExceedMinimum.value)
    return 'Must have at least 4 players'

  if (!canStartGame.value)
    return 'Waiting all players ready'

  return 'Start Game'
})

function handleReady() {
  const newIsReadyValue = !players.value[myPlayerIndex.value].isReady

  players.value[myPlayerIndex.value].isReady = newIsReadyValue

  sendDataToRoomLeader({ type: 'playerReady', message: newIsReadyValue })
}

function handleQuit() {
  quitGame()
  router.push({ name: 'home' })
}

function startGame() {
  const normalPlayers = players.value
  const leaderIndex = Math.floor(Math.random() * normalPlayers.length)
  const insiderIndex = Math.round(Math.random() * (normalPlayers.length - 1))

  const mapPlayersRole: GamePlayer[] = normalPlayers.map<GamePlayer>(
    (player, index) => ({
      ...player, 
      role: index === leaderIndex ? 'leader' : (index === insiderIndex ? 'insider' : 'villager')
    })
  )

  players.value = mapPlayersRole

  broadcastPeers({
    type: 'startGame',
  })

  broadcastPeers({
    type: 'changePlayers',
    players: mapPlayersRole,
  })

  const insiderPeer = normalPlayers[insiderIndex].peer

  const answer = thAnswers[Math.round(Math.random() * (thAnswers.length - 1))]

  gameAnswer.value = answer

  gameStatus.value = 'gameStart'

  sendGameDataToPeer(insiderPeer, {
    type: 'giveAnswer',
    message: answer,
  })
}
</script>

<template>
  <div class="text-4xl font-bold text-primary">
    Game Room
  </div>
  <div class="text-4xl font-bold">
    {{ isRoomLeader ? myPeer.id : roomLeaderConn.peer }}
  </div>

  <div v-for="player of players" :key="player.peer" class="flex w-full max-w-xs items-center gap-4">
    <svg v-if="player.isRoomLeader" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
      <path fill="#cfcfcf" d="M243.84 76.19a12.08 12.08 0 0 0-13.34-1.7l-50.21 25l-41.2 20.6l-44.95-19.3a12.1 12.1 0 0 0-11.27 0L3.5 119.19a12.07 12.07 0 0 0-6.05 14.59a12.07 12.07 0 0 0 14.58 6.05l50.21-25l41.2-20.6l44.95 19.3a12.1 12.1 0 0 0 11.27 0L252.5 96.39a12.07 12.07 0 0 0 6.05-14.59a12.07 12.07 0 0 0-14.58-6.05l-50.21 25l-41.2 20.6l-44.95-19.3a12.1 12.1 0 0 0-11.27 0L3.5 119.19a12.07 12.07 0 0 0-6.05 14.59a12.07 12.07 0 0 0 14.58 6.05l50.21-25l41.2-20.6l44.95 19.3a12.1 12.1 0 0 0 11.27 0L252.5 96.39a12.07 12.07 0 0 0 6.05-14.59a12.07 12.07 0 0 0-14.58-6.05l-50.21 25l-41.2 20.6l-44.95-19.3a12.1 12.1 0 0 0-11.27 0L3.5 119.19a12.07 12.07 0 0 0-6.05 14.59a12.07 12.07 0 0 0 14.58 6.05l50.21-25l41.2-20.6l44.95 19.3a12.1 12.1 0 0 0 11.27 0L252.5 96.39a12.07 12.07 0 0 0 6.05-14.59a12.07 12.07 0 0 0-14.58-6.05"/>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="#cfcfcf" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 10c5.33 0 8 2.67 8 8H4c0-5.33 2.67-8 8-8z"/>
    </svg>

    <span>{{ player.playerName }}</span>
    <span v-if="!player.isRoomLeader" class="text-primary text-opacity-40">({{ player.peer }})</span>

    <div v-if="player.isReady" class="badge badge-primary ml-auto">
      READY
    </div>
  </div>

  <BaseButton v-if="isRoomLeader" class="mt-4" :disabled="!canStartGame" @click="startGame">
    {{ startGameButtonText }}
  </BaseButton>

  <BaseButton v-else class="mt-4" @click="handleReady">
    Ready
  </BaseButton>

  <BaseButton outline @click="handleQuit">
    Quit
  </BaseButton>
</template>