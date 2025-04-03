import {trpc} from '../../lib/trpc'

export const HomePage = () => {
  const {data, error, isLoading, isFething, isError} = trpc.getNews.useQuery()
  if (isLoading || isFething) return <span>Loading...</span>
  if (isError) return <span>Error: {error.message}</span> 
  

  return (
    <div>
      <h1>News</h1>
      {data.news.map(news => (
        <div key={news.id}>
          <h2>{news.title}</h2>
          <p>{news.content}</p>
        </div>
      ))}

      
    </div>
  )
}