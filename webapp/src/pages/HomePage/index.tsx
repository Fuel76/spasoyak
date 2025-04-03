import { trpc } from '../../lib/trpc'

export const HomePage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getNews.useQuery()
  if (isLoading || isFetching) return <span>Loading...</span>
  if (isError) return <span>Error: {error.message}</span>

  return (
    <div>
      <h1>News</h1>
      {data.news.map((neww) => (
        <div key={neww.id}>
          <h2>{neww.title}</h2>
          <p>{neww.content}</p>
        </div>
      ))}
    </div>
  )
}
