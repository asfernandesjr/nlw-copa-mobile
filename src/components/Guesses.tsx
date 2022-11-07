import { useToast, FlatList } from 'native-base';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Game, GameProps } from '../components/Game'
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {
  const toast = useToast();
  const [ isLoading, setIsLoading] = useState(false);
  const [ firstTeamPoints, setFirstTeamPoints] = useState('');
  const [ secondTeamPoints, setSecondTeamPoints] = useState('');
  const [ games, setGames] = useState<GameProps[]>([] as GameProps[]);

  async function fetchGames() {

    try {
      setIsLoading(true);

      const response = await api.get(`/pools/${poolId}/games`)

      setGames(response.data.games)
      
    } catch (error) {
      return toast.show({
        title: 'Não foi possível encontrar os jogos do bolão.',
        placement: 'top',
        bgColor: 'red.500'
      })
      
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuessConfirmation(gameId: string) {
    try {
      setIsLoading(true);
      if(!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite.',
          placement: 'top',
          bgColor: 'red.500'
        })
      }
      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints)
      })

      toast.show({
        title: 'Palpite registrado com sucesso.',
        placement: 'top',
        bgColor: 'green.500'
      })

      fetchGames();
      
    } catch (error) {
      toast.show({
        title: 'Não foi possível enviar o palpite.',
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setIsLoading(false);
    }

    setFirstTeamPoints('');
    setSecondTeamPoints('');
  }

  useEffect(() => {
    fetchGames();
  }, [poolId]);

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <FlatList
      data={games}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirmation(item.id)}
        />
      )}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  );
}
