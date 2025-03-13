import { ref } from 'vue'

const playerName = ref('')

export default function useGame() {
  return { playerName }
}

export function setPlayerName(name: string) {
  playerName.value = name
}