import { useParams } from 'react-router-dom'

export const HomePage = () => {
  const { ideaNick } = useParams() as { ideaNick: string }
  return (
    <div>
      <h1>{ideaNick}</h1>
      <p>Description of idea 1...</p>
      <div>
        <p>Text paragrph 1 of idea 1...</p>
        <p>Text paragrph 2 of idea 1...</p>
        <p>Text paragrph 3 of idea 1...</p>
      </div>
    </div>
  )
}