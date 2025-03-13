import { ref } from 'vue'
import { defineStore } from 'pinia'
import Peer from 'peerjs'
import type { GamePlayer, GameStatus, GameSendingData } from './model'

export const useGameStore = defineStore('game', () => {
  const myPeer = new Peer()
  const players = ref<GamePlayer[]>([])
  const gameStatus = ref<GameStatus>(null)
  const gameAnswer = ref<string | null>(null)
  const roomLeaderConn = ref<Peer.DataConnection | null>(null)
  const myPlayerIndex = ref<number>(0)

  function createGame() {
    myPeer.on('open', (id) => {
      const roomCode = generateRoomCode()
      players.value.push({
        peer: id,
        playerName: myPlayerName.value,
        isRoomLeader: true,
        isReady: false,
        isVoted: false,
      })
      console.log('Room created with code:', roomCode)
    })
  }

  function joinGame(roomCode: string) {
    const conn = myPeer.connect(roomCode)
    conn.on('open', () => {
      conn.send({ type: 'newJoin', playerName: myPlayerName.value })
    })
    conn.on('data', (data: GameSendingData) => {
      handleData(data)
    })
  }

  function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return code
  }

  function handleData(data: GameSendingData) {
    // Handle incoming data here
  }

  return {
    myPeer,
    players,
    gameStatus,
    gameAnswer,
    roomLeaderConn,
    myPlayerIndex,
    createGame,
    joinGame,
    generateRoomCode,
  }
})

export const myPlayerName = ref('')